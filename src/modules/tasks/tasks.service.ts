import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Task } from '@database/entities/task.entity';
import { Company } from '@database/entities/company.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';
import { TaskActivityType } from '@common/enums/task-activity-type.enum';

import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto, GetTasksQueryDto } from './dto/task.dto';
import { TaskActivityService } from './task-activity.service';

export type TaskWithCustomFields = Task & { customFields: CustomFieldsMap };

type TaskWithCounts = Task & {
  commentsCount: number;
  attachmentsCount: number;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly _taskRepository: Repository<Task>,
    private readonly _permissions: PermissionsService,
    private readonly _customFieldsService: CustomFieldsService,
    private readonly _activityService: TaskActivityService,
    private readonly _dataSource: DataSource,
  ) {}

  async create(createDto: CreateTaskDto, user: AuthorizedUser): Promise<TaskWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.TASK_CREATE);

    const { customFields, ...taskData } = createDto;

    const taskId = await this._dataSource.transaction(async (manager) => {
      const company = await manager.findOne(Company, {
        where: { id: user.companyId },
        select: ['id', 'taskPrefix', 'taskCounter'],
      });

      if (!company) {
        throw new Error('Company not found');
      }

      company.taskCounter += 1;
      await manager.save(company);

      const taskKey = `${company.taskPrefix}-${company.taskCounter}`;

      const task = manager.create(Task, {
        ...taskData,
        key: taskKey,
        creatorId: user.id,
        companyId: user.companyId,
        departmentId: taskData.departmentId || user.departmentId,
      });

      const saved = await manager.save(task);

      if (customFields) {
        await this._customFieldsService.setValuesWithManager(
          manager,
          user.companyId,
          EntityType.TASK,
          saved.id,
          customFields,
        );
      }

      await this._activityService.log(
        saved.id,
        user.id,
        TaskActivityType.TASK_CREATED,
        undefined,
        manager,
      );

      return saved.id;
    });

    return this.findOne(taskId, user);
  }

  async findAll(
    user: AuthorizedUser,
    query: GetTasksQueryDto = {},
  ): Promise<TaskWithCustomFields[]> {
    await this._permissions.assertCan(user, PermissionAction.TASK_READ);

    const { stage, priority, assigneeId, creatorId, departmentId, search, limit } = query;

    const queryBuilder = this._taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .loadRelationCountAndMap('task.commentsCount', 'task.comments')
      .loadRelationCountAndMap('task.attachmentsCount', 'task.attachments')
      .where('task.companyId = :companyId', { companyId: user.companyId });

    if (stage) queryBuilder.andWhere('task.stage = :stage', { stage });
    if (priority) queryBuilder.andWhere('task.priority = :priority', { priority });
    if (assigneeId) queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    if (creatorId) queryBuilder.andWhere('task.creatorId = :creatorId', { creatorId });
    if (departmentId) queryBuilder.andWhere('task.departmentId = :departmentId', { departmentId });
    if (search) queryBuilder.andWhere('task.title ILIKE :search', { search: `%${search}%` });

    queryBuilder.orderBy('task.order', 'ASC').addOrderBy('task.createdAt', 'DESC');

    if (limit) queryBuilder.take(limit);

    const tasks = (await queryBuilder.getMany()) as TaskWithCounts[];

    if (tasks.length === 0) return [];

    const taskIds = tasks.map((t) => t.id);
    const allCustomFields = await this._customFieldsService.getValuesForMultipleEntities(
      user.companyId,
      EntityType.TASK,
      taskIds,
    );

    const customFieldsMap = new Map<string, CustomFieldsMap>();
    allCustomFields.forEach((cf) => {
      let entry = customFieldsMap.get(cf.entityId);
      if (!entry) {
        entry = {};
        customFieldsMap.set(cf.entityId, entry);
      }
      entry[cf.fieldKey] = cf.value;
    });

    return tasks.map((t) => ({
      ...t,
      customFields: customFieldsMap.get(t.id) || {},
    }));
  }

  async findOne(id: string, user: AuthorizedUser): Promise<TaskWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.TASK_READ);

    const task = await this._taskRepository.findOne({
      where: { id, companyId: user.companyId },
      relations: [
        'creator',
        'assignee',
        'comments',
        'comments.author',
        'attachments',
        'attachments.uploadedBy',
        'references',
        'activities',
        'activities.actor',
      ],
    });

    if (!task) {
      throw ExceptionFactory.taskNotFound(id);
    }

    const customFields = await this._customFieldsService.getValues(
      user.companyId,
      EntityType.TASK,
      task.id,
    );

    return {
      ...task,
      customFields,
    };
  }

  async update(
    id: string,
    updateDto: UpdateTaskDto,
    user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.TASK_UPDATE);

    const task = await this._taskRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!task) {
      throw ExceptionFactory.taskNotFound(id);
    }

    const { customFields, ...taskData } = updateDto;

    const oldStage = task.stage;
    const oldPriority = task.priority;
    const oldAssigneeId = task.assigneeId;

    Object.assign(task, taskData);

    const saved = await this._taskRepository.save(task);

    // Activity logging
    if (taskData.stage && taskData.stage !== oldStage) {
      await this._activityService.log(saved.id, user.id, TaskActivityType.STATUS_CHANGED, {
        old: oldStage,
        new: taskData.stage,
      });
    }
    if (taskData.priority && taskData.priority !== oldPriority) {
      await this._activityService.log(saved.id, user.id, TaskActivityType.PRIORITY_CHANGED, {
        old: oldPriority,
        new: taskData.priority,
      });
    }
    if (taskData.assigneeId !== undefined && taskData.assigneeId !== oldAssigneeId) {
      await this._activityService.log(saved.id, user.id, TaskActivityType.ASSIGNEE_CHANGED, {
        old: oldAssigneeId,
        new: taskData.assigneeId,
      });
    }

    if (customFields !== undefined) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.TASK,
        saved.id,
        customFields,
      );
    }

    return this.findOne(saved.id, user);
  }

  async updateStage(
    id: string,
    updateDto: UpdateTaskStageDto,
    user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.TASK_UPDATE_STAGE);

    const task = await this.findOne(id, user);
    const oldStage = task.stage;

    task.stage = updateDto.stage;
    if (updateDto.order !== undefined) {
      task.order = updateDto.order;
    }

    const saved = await this._taskRepository.save(task);

    if (updateDto.stage !== oldStage) {
      await this._activityService.log(saved.id, user.id, TaskActivityType.STATUS_CHANGED, {
        old: oldStage,
        new: updateDto.stage,
      });
    }

    return this.findOne(saved.id, user);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.TASK_DELETE);

    const task = await this.findOne(id, user);

    await this._taskRepository.softRemove(task);
  }
}
