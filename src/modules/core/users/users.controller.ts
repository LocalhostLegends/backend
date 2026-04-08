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
import { plainToInstance } from 'class-transformer';

import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@common/types/authorized-user.type';
import { PaginatedResult } from '@common/pagination/pagination.interface';
import { UserStatus } from '@database/enums/user-status.enum';

import { UserRolesGuard } from './guards/user-roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRoles } from './decorators/user-roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserResponseDto } from './dto/user-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  @UserRoles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this._usersService.findAllPaginated(filters, currentUser);

    return {
      ...result,
      data: plainToInstance(UserResponseDto, result.data, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    };
  }

  @Get('me')
  @UserRoles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async getCurrentUser(@CurrentUser() currentUser: AuthorizedUser): Promise<UserResponseDto> {
    const user = await this._usersService.findById(currentUser.id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Get('role/:role')
  @UserRoles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  async getUsersByRole(
    @Param('role') role: UserRole,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto[]> {
    const users = await this._usersService.getUsersByRole(currentUser.companyId, role);
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Get('status/:status')
  @UserRoles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Get users by status' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  async getUsersByStatus(
    @Param('status') status: UserStatus,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto[]> {
    const filters: UserFilterDto = { status };
    const result = await this._usersService.findAllPaginated(filters, currentUser);
    return plainToInstance(UserResponseDto, result.data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Get(':id')
  @UserRoles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    const user = await this._usersService.findOne(id, currentUser);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Patch(':id')
  @UserRoles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    const user = await this._usersService.update(id, updateUserDto, currentUser);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Post(':id/block')
  @UserRoles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block user (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    const user = await this._usersService.blockUser(id, currentUser);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Post(':id/unblock')
  @UserRoles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unblock user (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    const user = await this._usersService.unblockUser(id, currentUser);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Delete(':id')
  @UserRoles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._usersService.remove(id, currentUser);
  }
}
