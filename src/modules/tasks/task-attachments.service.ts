import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskAttachment } from '@database/entities/task-attachment.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { StorageService } from '@modules/storage/storage.service';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from '@common/enums/task-activity-type.enum';

@Injectable()
export class TaskAttachmentsService {
  constructor(
    @InjectRepository(TaskAttachment)
    private readonly _attachmentRepository: Repository<TaskAttachment>,
    private readonly _storageService: StorageService,
    private readonly _activityService: TaskActivityService,
  ) {}

  async create(
    taskId: string,
    file: Express.Multer.File,
    user: AuthorizedUser,
  ): Promise<TaskAttachment> {
    const path = `tasks/${taskId}/attachments`;
    const { url } = await this._storageService.uploadFile(file, path);

    const attachment = this._attachmentRepository.create({
      taskId,
      uploadedById: user.id,
      fileName: file.originalname,
      fileUrl: url,
      mimeType: file.mimetype,
      size: file.size,
    });

    const saved = await this._attachmentRepository.save(attachment);

    await this._activityService.log(taskId, user.id, TaskActivityType.FILE_UPLOADED, {
      attachmentId: saved.id,
      fileName: saved.fileName,
    });

    return saved;
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    const attachment = await this._attachmentRepository.findOne({
      where: { id },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const key = this._storageService.extractKeyFromUrl(attachment.fileUrl);
    if (key) {
      await this._storageService.deleteFile(key);
    }

    await this._attachmentRepository.remove(attachment);

    await this._activityService.log(attachment.taskId, user.id, TaskActivityType.FILE_DELETED, {
      attachmentId: id,
      fileName: attachment.fileName,
    });
  }
}
