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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { JwtAuthGuard } from '@/modules/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto'
import { DepartmentSwagger } from './swagger/departments.swagger';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRole('hr')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  @DepartmentSwagger.create()
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return plainToInstance(DepartmentResponseDto, await this.departmentsService.create(createDepartmentDto), { excludeExtraneousValues: true });
  }

  @Get()
  @DepartmentSwagger.findAll()
  async findAll() {
    return plainToInstance(DepartmentResponseDto, await this.departmentsService.findAll(), { excludeExtraneousValues: true });
  }

  @Get(':id')
  @DepartmentSwagger.findOne()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return plainToInstance(DepartmentResponseDto, await this.departmentsService.findOne(id), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @DepartmentSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return plainToInstance(DepartmentResponseDto, await this.departmentsService.update(id, updateDepartmentDto), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @DepartmentSwagger.delete()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
