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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  @RequireUserRoles(...USER_ROLES)
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this._usersService.findAllPaginated(filters, currentUser);

    return { ...result, data: transformToDto(UserResponseDto, result.data) };
  }

  @Get('me')
  @RequireUserRoles(...USER_ROLES)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async getCurrentUser(@CurrentUser() currentUser: AuthorizedUser): Promise<UserResponseDto> {
    return transformToDto(
      UserResponseDto,
      await this._usersService.findOne(currentUser.id, currentUser),
    );
  }

  @Get('role/:role')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
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
  @ApiOperation({ summary: 'Get users by status' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
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
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.findOne(id, currentUser));
  }

  @Patch(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
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
  @ApiOperation({ summary: 'Block user (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.blockUser(id, currentUser));
  }

  @Post(':id/unblock')
  @RequireUserRoles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unblock user (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return transformToDto(UserResponseDto, await this._usersService.unblockUser(id, currentUser));
  }

  @Delete(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._usersService.remove(id, currentUser);
  }
}
