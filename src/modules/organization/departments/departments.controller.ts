import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { transformToDto } from '@/common/utils/dto.utils';
import { type AuthorizedUser } from '@/modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { Resource } from '@modules/permissions/decorators/resource.decorator';
import { Department } from '@database/entities/department.entity';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermission(PermissionAction.DEPARTMENT_CREATE)
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
  @RequirePermission(PermissionAction.DEPARTMENT_READ)
  @swagger.ApiFindAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<DepartmentResponseDto[]> {
    return transformToDto(
      DepartmentResponseDto,
      await this.departmentsService.findAll(currentUser),
    );
  }

  @Get(':id')
  @RequirePermission(PermissionAction.DEPARTMENT_READ)
  @Resource(Department)
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
  @RequirePermission(PermissionAction.DEPARTMENT_UPDATE)
  @Resource(Department)
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
  @RequirePermission(PermissionAction.DEPARTMENT_DELETE)
  @Resource(Department)
  @swagger.ApiRemove()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this.departmentsService.remove(id, currentUser);
  }
}
