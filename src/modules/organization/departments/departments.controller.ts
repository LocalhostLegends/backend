import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { RequireUserRoles } from '@modules/core/users/decorators/require-user-roles.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { transformToDto } from '@/common/utils/dto.utils';
import { type AuthorizedUser } from '@/modules/core/users/users.types';
import { UserRole } from '@common/enums/user-role.enum';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('departments')
@UseGuards(JwtAuthGuard, UserRolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiCreate()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<DepartmentResponseDto> {
    return transformToDto(
      DepartmentResponseDto,
      await this.departmentsService.create(createDepartmentDto, currentUser),
    );
  }

  @Get()
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiFindAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<DepartmentResponseDto[]> {
    return transformToDto(
      DepartmentResponseDto,
      await this.departmentsService.findAll(currentUser),
    );
  }

  @Get(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<DepartmentResponseDto> {
    return transformToDto(
      DepartmentResponseDto,
      await this.departmentsService.findOne(id, currentUser),
    );
  }

  @Patch(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<DepartmentResponseDto> {
    return transformToDto(
      DepartmentResponseDto,
      await this.departmentsService.update(id, updateDepartmentDto, currentUser),
    );
  }

  @Delete(':id')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiRemove()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this.departmentsService.remove(id, currentUser);
  }
}
