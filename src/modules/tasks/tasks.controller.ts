import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { CsvService } from '@modules/csv/csv.service';

import { TasksService, TaskWithCustomFields } from './tasks.service';
import { TaskCommentsService } from './task-comments.service';
import { TaskAttachmentsService } from './task-attachments.service';
import { TaskReferencesService } from './task-references.service';
import { TaskActivityService } from './task-activity.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto, GetTasksQueryDto } from './dto/task.dto';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from './dto/task-comment.dto';
import { CreateTaskReferenceDto } from './dto/task-reference.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly _tasksService: TasksService,
    private readonly _commentsService: TaskCommentsService,
    private readonly _attachmentsService: TaskAttachmentsService,
    private readonly _referencesService: TaskReferencesService,
    private readonly _activityService: TaskActivityService,
    private readonly _csvService: CsvService,
  ) {}

  @Post()
  @swagger.ApiCreate()
  create(
    @Body() createDto: CreateTaskDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.create(createDto, user);
  }

  @Get()
  @swagger.ApiGetAll()
  findAll(
    @CurrentUser() user: AuthorizedUser,
    @Query() query: GetTasksQueryDto,
  ): Promise<TaskWithCustomFields[]> {
    return this._tasksService.findAll(user, query);
  }

  @Get('export/csv')
  @swagger.ApiExportCsv()
  async exportCsv(
    @CurrentUser() user: AuthorizedUser,
    @Query() query: GetTasksQueryDto,
    @Res() res: Response,
  ) {
    const stream = await this._tasksService.getExportStream(user, query);
    const columns = [
      { header: 'Key', key: 'task_key' },
      { header: 'Title', key: 'task_title' },
      { header: 'Stage', key: 'task_stage' },
      { header: 'Priority', key: 'task_priority' },
      {
        header: 'Creator',
        key: 'creator_firstName',
        transform: (_val: unknown, item: Record<string, unknown>) =>
          `${String(item.creator_firstName)} ${String(item.creator_lastName)}`,
      },
      {
        header: 'Assignee',
        key: 'assignee_firstName',
        transform: (_val: unknown, item: Record<string, unknown>) =>
          item.assignee_id
            ? `${String(item.assignee_firstName)} ${String(item.assignee_lastName)}`
            : 'Unassigned',
      },
      { header: 'Created At', key: 'task_createdAt' },
    ];

    await this._csvService.streamCsv(res, 'tasks-export', columns, stream);
  }

  @Get(':id')
  @swagger.ApiGetOne()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.findOne(id, user);
  }

  @Patch(':id')
  @swagger.ApiUpdate()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.update(id, updateDto, user);
  }

  @Patch(':id/stage')
  @swagger.ApiUpdateStage()
  updateStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskStageDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.updateStage(id, updateDto, user);
  }

  @Delete(':id')
  @swagger.ApiDelete()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._tasksService.remove(id, user);
  }

  // Comments
  @Post(':id/comments')
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._commentsService.create(id, dto.content, user);
  }

  @Patch(':id/comments/:commentId')
  updateComment(
    @Param('_id', ParseUUIDPipe) _id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateTaskCommentDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._commentsService.update(commentId, dto.content, user);
  }

  @Delete(':id/comments/:commentId')
  removeComment(
    @Param('_id', ParseUUIDPipe) _id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._commentsService.remove(commentId, user);
  }

  // Attachments
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._attachmentsService.create(id, file, user);
  }

  @Delete(':id/attachments/:attachmentId')
  removeAttachment(
    @Param('_id', ParseUUIDPipe) _id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._attachmentsService.remove(attachmentId, user);
  }

  // References
  @Post(':id/references')
  addReference(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTaskReferenceDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._referencesService.create(id, dto, user);
  }

  @Delete(':id/references/:referenceId')
  removeReference(
    @Param('_id', ParseUUIDPipe) _id: string,
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._referencesService.remove(referenceId, user);
  }

  // Activity
  @Get(':id/activity')
  getActivity(@Param('id', ParseUUIDPipe) id: string) {
    return this._activityService.findByTaskId(id);
  }
}
