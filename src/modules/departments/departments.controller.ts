import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';

import {
  SwaggerCreateDepartment,
  SwaggerFindAllDepartments,
  SwaggerFindOneDepartment,
  SwaggerUpdateDepartment,
  SwaggerDeleteDepartment,
} from './swagger/departments.swagger';
import { DepartmentResponse } from './swagger/department.schema';

@ApiTags('Departments')
@ApiBearerAuth()
@ApiExtraModels(DepartmentResponse)
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRole('hr')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  @SwaggerCreateDepartment()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @SwaggerFindAllDepartments()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @SwaggerFindOneDepartment()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @SwaggerUpdateDepartment()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @SwaggerDeleteDepartment()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}