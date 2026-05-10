import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TaskComment } from '@database/entities/task-comment.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from '@common/enums/task-activity-type.enum';
import { TasksService } from './tasks.service';
import { TaskCommentAddedEvent } from '@modules/notifications/events/notification.events';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly _commentRepository: Repository<TaskComment>,
    private readonly _activityService: TaskActivityService,
    private readonly _eventBus: EventEmitter2,
    @Inject(forwardRef(() => TasksService))
    private readonly _tasksService: TasksService,
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

    // Notify task creator and assignee
    try {
      const task = await this._tasksService.findOne(taskId, user);
      const recipients = new Set<string>();
      if (task.creatorId && task.creatorId !== user.id) recipients.add(task.creatorId);
      if (task.assigneeId && task.assigneeId !== user.id) recipients.add(task.assigneeId);

      recipients.forEach((userId) => {
        this._eventBus.emit(
          'notification.task_comment_added',
          new TaskCommentAddedEvent(userId, {
            taskId: task.id,
            taskTitle: task.title,
            authorName: user.firstName + ' ' + user.lastName,
          }),
        );
      });
    } catch {
      // Silently fail if task not found or access denied for notification
    }

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
