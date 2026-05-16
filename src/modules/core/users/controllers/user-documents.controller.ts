import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseUUIDPipe,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { UserDocumentsService } from '../user-documents.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UserDocumentResponseDto } from '../dto/user-document-response.dto';
import { UpdateDocumentStatusDto } from '../dto/update-document-status.dto';
import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@/modules/core/users/users.types';
import { swagger } from '../swagger';

@swagger.ApiTags()
@Controller()
export class UserDocumentsController {
  constructor(private readonly _documentsService: UserDocumentsService) {}

  @Post('users/:userId/documents')
  @swagger.ApiUploadDocument()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('userId') userIdParam: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(pdf|jpg|jpeg|png|doc|docx)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserDocumentResponseDto> {
    const targetUserId = userIdParam === 'me' ? currentUser.id : userIdParam;

    // Only allow uploading for self or if HR/Admin
    if (targetUserId !== currentUser.id && !this.isHRorAdmin(currentUser)) {
      throw new ForbiddenException('You do not have permission to upload documents for this user');
    }

    return this._documentsService.upload(
      targetUserId,
      currentUser.companyId,
      file,
      dto,
      currentUser.id,
    );
  }

  @Get('users/:userId/documents')
  @swagger.ApiFindAllDocuments()
  async findAll(
    @Param('userId') userIdParam: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserDocumentResponseDto[]> {
    const targetUserId = userIdParam === 'me' ? currentUser.id : userIdParam;

    if (targetUserId !== currentUser.id && !this.isHRorAdmin(currentUser)) {
      throw new ForbiddenException('You do not have permission to view documents for this user');
    }

    return this._documentsService.findAll(targetUserId);
  }

  @Get('users/:userId/documents/:id')
  @swagger.ApiFindOneDocument()
  async findOne(
    @Param('userId') userIdParam: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserDocumentResponseDto> {
    const targetUserId = userIdParam === 'me' ? currentUser.id : userIdParam;

    if (targetUserId !== currentUser.id && !this.isHRorAdmin(currentUser)) {
      throw new ForbiddenException('You do not have permission to view this document');
    }

    return this._documentsService.findOne(id, targetUserId);
  }

  @Patch('users/:userId/documents/:id/status')
  @swagger.ApiUpdateDocumentStatus()
  async updateStatus(
    @Param('userId') userIdParam: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentStatusDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserDocumentResponseDto> {
    const targetUserId = userIdParam === 'me' ? currentUser.id : userIdParam;

    // 1. Check if user is HR or Admin
    if (!this.isHRorAdmin(currentUser)) {
      throw new ForbiddenException('Only HR and Admins can verify documents');
    }

    // 2. Prevent self-verification
    if (targetUserId === currentUser.id) {
      throw new ForbiddenException('You cannot verify your own documents');
    }

    return this._documentsService.updateStatus(id, targetUserId, dto);
  }

  @Delete('users/:userId/documents/:id')
  @swagger.ApiRemoveDocument()
  async remove(
    @Param('userId') userIdParam: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<{ success: true }> {
    const targetUserId = userIdParam === 'me' ? currentUser.id : userIdParam;

    if (targetUserId !== currentUser.id && !this.isHRorAdmin(currentUser)) {
      throw new ForbiddenException('You do not have permission to delete this document');
    }

    await this._documentsService.remove(id, targetUserId);
    return { success: true };
  }

  private isHRorAdmin(user: AuthorizedUser): boolean {
    const roles = user.roles;
    return (
      roles.includes(UserRole.HR) ||
      roles.includes(UserRole.ADMIN) ||
      roles.includes(UserRole.SUPER_ADMIN)
    );
  }
}
