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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { UserRolesGuard } from '@common/guards/user-roles.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { transformToDto } from '@common/utils/app.utils';
import { type AuthorizedUser } from '@common/types/authorized-user.type';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@RequireRole('hr')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department in the current company' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Department with this name already exists in the current company',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Get all departments in the current company' })
  @ApiResponse({
    status: 200,
    description: 'List of departments in the current company',
    type: [DepartmentResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<DepartmentResponseDto[]> {
    return transformToDto(
      DepartmentResponseDto,
      await this.departmentsService.findAll(currentUser),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Department found',
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid department ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', description: 'Department UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid department ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Department with this name already exists in the current company',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Department deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid department ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this.departmentsService.remove(id, currentUser);
  }
}
