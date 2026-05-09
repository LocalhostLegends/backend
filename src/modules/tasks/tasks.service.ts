import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';

import { Task } from '@database/entities/task.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';

import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto, GetTasksQueryDto } from './dto/task.dto';

export type TaskWithCustomFields = Task & { customFields: CustomFieldsMap };

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly _taskRepository: Repository<Task>,
    private readonly _permissions: PermissionsService,
    private readonly _customFieldsService: CustomFieldsService,
  ) {}

  async create(createDto: CreateTaskDto, user: AuthorizedUser): Promise<TaskWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.TASK_CREATE);

    const { customFields, ...taskData } = createDto;

    const task = this._taskRepository.create({
      ...taskData,
      creatorId: user.id,
      companyId: user.companyId,
      departmentId: taskData.departmentId || user.departmentId,
    });

    const saved = await this._taskRepository.save(task);

    if (customFields) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.TASK,
        saved.id,
        customFields,
      );
    }

    return this.findOne(saved.id, user);
  }

  async findAll(
    user: AuthorizedUser,
    query: GetTasksQueryDto = {},
  ): Promise<TaskWithCustomFields[]> {
    await this._permissions.assertCan(user, PermissionAction.TASK_READ);

    const { stage, priority, assigneeId, creatorId, departmentId, search, limit } = query;

    const where: FindOptionsWhere<Task> = { companyId: user.companyId };

    if (stage) where.stage = stage;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;
    if (departmentId) where.departmentId = departmentId;
    if (search) where.title = ILike(`%${search}%`);

    const tasks = await this._taskRepository.find({
      where,
      relations: ['creator', 'assignee'],
      order: { order: 'ASC', createdAt: 'DESC' },
      take: limit || 100,
    });

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
      relations: ['creator', 'assignee'],
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

    Object.assign(task, taskData);

    const saved = await this._taskRepository.save(task);

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

    task.stage = updateDto.stage;
    if (updateDto.order !== undefined) {
      task.order = updateDto.order;
    }

    const saved = await this._taskRepository.save(task);
    return this.findOne(saved.id, user);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.TASK_DELETE);

    const task = await this.findOne(id, user);

    await this._taskRepository.softRemove(task);
  }
}
