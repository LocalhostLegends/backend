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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { RolesGuard } from '@common/guards/roles.guard';
import { PaginatedResult } from '@common/pagination/pagination.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/auth/auth.types';

import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFilterDto } from '../dto/user-filter.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserSwagger } from '../swagger/user.swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  @UserSwagger.findAll()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: UserFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this._usersService.findAllPaginated(filters, currentUser);

    return {
      ...result,
      data: plainToInstance(UserResponseDto, result.data, { excludeExtraneousValues: true }),
    };
  }

  @Get(':id')
  @UserSwagger.findOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, await this._usersService.findOne(id, currentUser), {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @UserSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<UserResponseDto> {
    return plainToInstance(
      UserResponseDto,
      await this._usersService.update(id, updateUserDto, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Delete(':id')
  @UserSwagger.delete()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    return this._usersService.remove(id, currentUser);
  }
}
