import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';

import { Task } from '@database/entities/task.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto, GetTasksQueryDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly _taskRepository: Repository<Task>,
    private readonly _permissions: PermissionsService,
  ) {}

  async create(createDto: CreateTaskDto, user: AuthorizedUser): Promise<Task> {
    await this._permissions.assertCan(user, PermissionAction.TASK_CREATE);

    const task = this._taskRepository.create({
      ...createDto,
      creatorId: user.id,
      companyId: user.companyId,
      departmentId: createDto.departmentId || user.departmentId,
    });

    return this._taskRepository.save(task);
  }

  async findAll(user: AuthorizedUser, query: GetTasksQueryDto = {}): Promise<Task[]> {
    await this._permissions.assertCan(user, PermissionAction.TASK_READ);

    const { stage, priority, assigneeId, creatorId, departmentId, search, limit } = query;

    const where: FindOptionsWhere<Task> = { companyId: user.companyId };

    if (stage) where.stage = stage;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;
    if (departmentId) where.departmentId = departmentId;
    if (search) where.title = ILike(`%${search}%`);

    return this._taskRepository.find({
      where,
      relations: ['creator', 'assignee'],
      order: { order: 'ASC', createdAt: 'DESC' },
      take: limit || 100,
    });
  }

  async findOne(id: string, user: AuthorizedUser): Promise<Task> {
    await this._permissions.assertCan(user, PermissionAction.TASK_READ);

    const task = await this._taskRepository.findOne({
      where: { id, companyId: user.companyId },
      relations: ['creator', 'assignee'],
    });

    if (!task) {
      throw ExceptionFactory.taskNotFound(id);
    }

    return task;
  }

  async update(id: string, updateDto: UpdateTaskDto, user: AuthorizedUser): Promise<Task> {
    await this._permissions.assertCan(user, PermissionAction.TASK_UPDATE);

    const task = await this.findOne(id, user);

    Object.assign(task, updateDto);

    return this._taskRepository.save(task);
  }

  async updateStage(
    id: string,
    updateDto: UpdateTaskStageDto,
    user: AuthorizedUser,
  ): Promise<Task> {
    await this._permissions.assertCan(user, PermissionAction.TASK_UPDATE_STAGE);

    const task = await this.findOne(id, user);

    task.stage = updateDto.stage;
    if (updateDto.order !== undefined) {
      task.order = updateDto.order;
    }

    return this._taskRepository.save(task);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.TASK_DELETE);

    const task = await this.findOne(id, user);

    await this._taskRepository.softRemove(task);
  }
}
