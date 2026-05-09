import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '@database/entities/task.entity';
import { TaskComment } from '@database/entities/task-comment.entity';
import { TaskAttachment } from '@database/entities/task-attachment.entity';
import { TaskReference } from '@database/entities/task-reference.entity';
import { TaskActivity } from '@database/entities/task-activity.entity';
import { Company } from '@database/entities/company.entity';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { CustomFieldsModule } from '@modules/custom-fields/custom-fields.module';
import { StorageModule } from '@modules/storage/storage.module';

import { TasksService } from './tasks.service';
import { TaskActivityService } from './task-activity.service';
import { TaskCommentsService } from './task-comments.service';
import { TaskAttachmentsService } from './task-attachments.service';
import { TaskReferencesService } from './task-references.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskComment,
      TaskAttachment,
      TaskReference,
      TaskActivity,
      Company,
    ]),
    PermissionsModule,
    CustomFieldsModule,
    StorageModule,
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskActivityService,
    TaskCommentsService,
    TaskAttachmentsService,
    TaskReferencesService,
  ],
  exports: [
    TasksService,
    TaskActivityService,
    TaskCommentsService,
    TaskAttachmentsService,
    TaskReferencesService,
  ],
})
export class TasksModule {}
