import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
  ValidationPipe,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { PaginatedResult } from '@modules/pagination/pagination.interfaces';
import { transformToDto } from '@common/utils/dto.utils';
import { UserStatus } from '@common/enums/user-status.enum';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { Resource } from '@modules/permissions/decorators/resource.decorator';
import { User } from '@database/entities/user.entity';

import { CurrentUser } from '../decorators/current-user.decorator';
import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { swagger } from '../swagger';

@swagger.ApiTags()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  @RequirePermission(PermissionAction.USER_READ)
  @swagger.ApiFindAll()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this._usersService.findAllPaginated(filters, currentUser);

    return { ...result, data: transformToDto(UserResponseDto, result.data) };
  }

  @Get('me')
  @swagger.ApiGetCurrentUser()
  async getCurrentUser(@CurrentUser() currentUser: AuthorizedUser): Promise<UserResponseDto> {
    return transformToDto(
      UserResponseDto,
      await this._usersService.findOne(currentUser.id, currentUser),
    );
  }

  @Get('role/:role')
  @RequirePermission(PermissionAction.USER_READ)
  @swagger.ApiGetUsersByRole()
  async getUsersByRole(
    @Param('role') role: UserRole,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto[]> {
    return transformToDto(
      UserResponseDto,
      await this._usersService.getUsersByRole(currentUser, role),
    );
  }

  @Get('status/:status')
  @RequirePermission(PermissionAction.USER_READ)
  @swagger.ApiGetUsersByStatus()
  async getUsersByStatus(
    @Param('status') status: UserStatus,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto[]> {
    const filters = { status };
    const result = await this._usersService.findAllPaginated(filters, currentUser);

    return transformToDto(UserResponseDto, result.data);
  }

  @Get(':id')
  @RequirePermission(PermissionAction.USER_READ)
  @Resource(User)
  @swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.findOne(id, currentUser));
  }

  @Patch(':id')
  @RequirePermission(PermissionAction.USER_UPDATE)
  @Resource(User)
  @swagger.ApiUpdateUser()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(
      UserResponseDto,
      await this._usersService.update(id, updateUserDto, currentUser),
    );
  }

  @Post(':id/block')
  @RequirePermission(PermissionAction.USER_UPDATE)
  @Resource(User)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiBlockUser()
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.blockUser(id, currentUser));
  }

  @Post(':id/unblock')
  @RequirePermission(PermissionAction.USER_UPDATE)
  @Resource(User)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiUnblockUser()
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.unblockUser(id, currentUser));
  }

  @Delete(':id')
  @RequirePermission(PermissionAction.USER_DELETE)
  @Resource(User)
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiRemoveUser()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._usersService.remove(id, currentUser);
  }
}
