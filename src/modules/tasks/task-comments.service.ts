import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskComment } from '@database/entities/task-comment.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from '@common/enums/task-activity-type.enum';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly _commentRepository: Repository<TaskComment>,
    private readonly _activityService: TaskActivityService,
  ) {}

  async create(taskId: string, content: string, user: AuthorizedUser): Promise<TaskComment> {
    const comment = this._commentRepository.create({
      taskId,
      authorId: user.id,
      content,
    });

    const saved = await this._commentRepository.save(comment);

    await this._activityService.log(taskId, user.id, TaskActivityType.COMMENT_ADDED, {
      commentId: saved.id,
      content: content.substring(0, 100),
    });

    return this.findOne(saved.id);
  }

  async findOne(id: string): Promise<TaskComment> {
    const comment = await this._commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment;
  }

  async update(id: string, content: string, user: AuthorizedUser): Promise<TaskComment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id) {
      throw new Error('You can only edit your own comments');
    }

    comment.content = content;
    const saved = await this._commentRepository.save(comment);

    await this._activityService.log(comment.taskId, user.id, TaskActivityType.COMMENT_UPDATED, {
      commentId: saved.id,
    });

    return saved;
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id) {
      throw new Error('You can only delete your own comments');
    }

    await this._commentRepository.remove(comment);

    await this._activityService.log(comment.taskId, user.id, TaskActivityType.COMMENT_DELETED, {
      commentId: id,
    });
  }
}
