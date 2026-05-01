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
import { USER_ROLES } from '@common/constants/common.constants';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { PaginatedResult } from '@modules/pagination/pagination.interfaces';
import { transformToDto } from '@common/utils/dto.utils';
import { UserStatus } from '@common/enums/user-status.enum';
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { RequireUserRoles } from '@modules/core/users/decorators/require-user-roles.decorator';

import { CurrentUser } from '../decorators/current-user.decorator';
import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { swagger } from '../swagger';

@swagger.ApiTags()
@UseGuards(JwtAuthGuard, UserRolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  @RequireUserRoles(...USER_ROLES)
  @swagger.ApiFindAll()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this._usersService.findAllPaginated(filters, currentUser);

    return { ...result, data: transformToDto(UserResponseDto, result.data) };
  }

  @Get('me')
  @RequireUserRoles(...USER_ROLES)
  @swagger.ApiGetCurrentUser()
  async getCurrentUser(@CurrentUser() currentUser: AuthorizedUser): Promise<UserResponseDto> {
    return transformToDto(
      UserResponseDto,
      await this._usersService.findOne(currentUser.id, currentUser),
    );
  }

  @Get('role/:role')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
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
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
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
  @RequireUserRoles(...USER_ROLES)
  @swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.findOne(id, currentUser));
  }

  @Patch(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
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
  @RequireUserRoles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiBlockUser()
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.blockUser(id, currentUser));
  }

  @Post(':id/unblock')
  @RequireUserRoles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiUnblockUser()
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.unblockUser(id, currentUser));
  }

  @Delete(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiRemoveUser()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._usersService.remove(id, currentUser);
  }
}
