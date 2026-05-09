import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskReference } from '@database/entities/task-reference.entity';
import { TaskReferenceType } from '@common/enums/task-reference-type.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from '@common/enums/task-activity-type.enum';

@Injectable()
export class TaskReferencesService {
  constructor(
    @InjectRepository(TaskReference)
    private readonly _referenceRepository: Repository<TaskReference>,
    private readonly _activityService: TaskActivityService,
  ) {}

  async create(
    taskId: string,
    data: { type: TaskReferenceType; title: string; url: string },
    user: AuthorizedUser,
  ): Promise<TaskReference> {
    const reference = this._referenceRepository.create({
      taskId,
      ...data,
    });

    const saved = await this._referenceRepository.save(reference);

    await this._activityService.log(taskId, user.id, TaskActivityType.LINK_ADDED, {
      referenceId: saved.id,
      title: saved.title,
      type: saved.type,
    });

    return saved;
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    const reference = await this._referenceRepository.findOne({
      where: { id },
    });

    if (!reference) {
      throw new Error('Reference not found');
    }

    await this._referenceRepository.remove(reference);

    await this._activityService.log(reference.taskId, user.id, TaskActivityType.LINK_REMOVED, {
      referenceId: id,
      title: reference.title,
    });
  }
}
