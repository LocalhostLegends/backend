import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '@common/guards/roles.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { UserRole } from '@database/entities/user.entity.enums';
import { User } from '@database/entities/user.entity';

import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponse } from '../swagger/user.schema';
import { UserSwagger } from '../swagger/user.swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { AuthorizedUser } from '@/modules/auth/auth.types';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(UserResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
  @RequireRole(UserRole.HR)
  @UserSwagger.create()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this._usersService.create(createUserDto);
  }

  @Get()
  @RequireRole(UserRole.HR)
  @UserSwagger.findAll()
  findAll(): Promise<User[]> {
    return this._usersService.findAll();
  }

  @Get(':id')
  @UserSwagger.findOne()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<User> {
    return this._usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UserSwagger.update()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<User> {
    return this._usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @RequireRole(UserRole.HR)
  @UserSwagger.delete()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._usersService.remove(id);
  }
}
