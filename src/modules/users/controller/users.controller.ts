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

import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthorizedUser } from '@modules/auth/auth.types';
import { PaginatedResult } from '@common/pagination/pagination.interface';
import { UserRole, UserStatus } from '@database/entities/user.entity.enums';

import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
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
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  async getCurrentUser(
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    const user = await this._usersService.findById(currentUser.id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Get('role/:role')
  @Roles(UserRole.ADMIN, UserRole.HR)
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
  @Roles(UserRole.ADMIN, UserRole.HR)
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
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
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
  @Roles(UserRole.ADMIN, UserRole.HR)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._usersService.remove(id, currentUser);
  }
}