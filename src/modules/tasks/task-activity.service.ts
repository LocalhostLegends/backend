import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { TaskActivity } from '@database/entities/task-activity.entity';
import { TaskActivityType } from '@common/enums/task-activity-type.enum';

@Injectable()
export class TaskActivityService {
  constructor(
    @InjectRepository(TaskActivity)
    private readonly _activityRepository: Repository<TaskActivity>,
  ) {}

  async log(
    taskId: string,
    actorId: string,
    type: TaskActivityType,
    payload?: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<TaskActivity> {
    const repo = manager ? manager.getRepository(TaskActivity) : this._activityRepository;

    const activity = repo.create({
      taskId,
      actorId,
      type,
      payload,
    });
    return repo.save(activity);
  }

  async findByTaskId(taskId: string): Promise<TaskActivity[]> {
    return this._activityRepository.find({
      where: { taskId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
    });
  }
}
