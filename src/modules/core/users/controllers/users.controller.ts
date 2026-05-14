import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  ValidationPipe,
  Post,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { PermissionAction } from '@common/enums/permission-action.enum';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { PaginatedResult } from '@modules/pagination/pagination.interfaces';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { Resource } from '@modules/permissions/decorators/resource.decorator';
import { User } from '@database/entities/user.entity';
import { CsvService } from '@modules/csv/csv.service';

import { CurrentUser } from '../decorators/current-user.decorator';
import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserDirectoryResponseDto } from '../dto/user-directory-response.dto';

import { swagger } from '../swagger';

@swagger.ApiTags()
@Controller('users')
export class UsersController {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _csvService: CsvService,
  ) {}

  @Get()
  @RequirePermission(PermissionAction.USER_READ)
  @swagger.ApiFindAll()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserResponseDto>> {
    return this._usersService.findAllPaginated(filters, currentUser);
  }

  @Get('export/csv')
  @RequirePermission(PermissionAction.USER_READ)
  @swagger.ApiExportCsv()
  async exportCsv(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
    @Res() res: Response,
  ) {
    const stream = await this._usersService.getExportStream(filters, currentUser);
    const columns = [
      { header: 'First Name', key: 'user_firstName' },
      { header: 'Last Name', key: 'user_lastName' },
      { header: 'Email', key: 'user_email' },
      { header: 'Status', key: 'user_status' },
      { header: 'Department', key: 'department_name' },
      { header: 'Position', key: 'position_name' },
      { header: 'Joined At', key: 'user_createdAt' },
    ];

    await this._csvService.streamCsv(res, 'users-export', columns, stream);
  }

  @Get('directory')
  @swagger.ApiGetDirectory()
  async getDirectory(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserDirectoryResponseDto>> {
    return this._usersService.getDirectoryPaginated(filters, currentUser);
  }

  @Get('me')
  @swagger.ApiGetCurrent()
  async getCurrentUser(@CurrentUser() currentUser: AuthorizedUser): Promise<UserResponseDto> {
    return this._usersService.findOne(currentUser.id, currentUser);
  }

  @Get(':id')
  @RequirePermission(PermissionAction.USER_READ)
  @Resource(User)
  @swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return this._usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @RequirePermission(PermissionAction.USER_UPDATE)
  @Resource(User)
  @swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return this._usersService.update(id, updateUserDto, currentUser);
  }

  @Post(':id/block')
  @RequirePermission(PermissionAction.USER_UPDATE)
  @Resource(User)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiBlock()
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return this._usersService.blockUser(id, currentUser);
  }

  @Post(':id/unblock')
  @RequirePermission(PermissionAction.USER_UPDATE)
  @Resource(User)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiUnblock()
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return this._usersService.unblockUser(id, currentUser);
  }

  @Delete(':id')
  @RequirePermission(PermissionAction.USER_DELETE)
  @Resource(User)
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiRemove()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._usersService.remove(id, currentUser);
  }
}
