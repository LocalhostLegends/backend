import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '@common/guards/roles.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { UserRole } from '@database/entities/user.entity.enums';
import { User } from '@database/entities/user.entity';

import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponse } from '../swagger/user.schema';
import { SwaggerCreateUser, SwaggerDeleteUser, SwaggerFindAllUsers, SwaggerFindOneUser, SwaggerUpdateUser } from '../swagger/user.swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthorizedUser } from '../../auth/auth.types';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(UserResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) { }

  @Post()
  @RequireRole(UserRole.HR)
  @SwaggerCreateUser()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this._usersService.create(createUserDto);
  }

  @Get()
  @RequireRole(UserRole.HR)
  @SwaggerFindAllUsers()
  findAll(): Promise<User[]> {
    return this._usersService.findAll();
  }

  @Get(':id')
  @SwaggerFindOneUser()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser
  ): Promise<User> {
    return this._usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @SwaggerUpdateUser()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthorizedUser
  ): Promise<User> {
    return this._usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @RequireRole(UserRole.HR)
  @SwaggerDeleteUser()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._usersService.remove(id);
  }
}