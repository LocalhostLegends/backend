import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { DepartmentResponse } from './department.schema';

export const DepartmentSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new department' }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Department created successfully',
        type: DepartmentResponse,
      }),
      ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Department with this name already exists',
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied. HR role required',
      }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all departments' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'List of departments',
        type: [DepartmentResponse],
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied. HR role required',
      }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get department by ID' }),
      ApiParam({ name: 'id', description: 'Department UUID', type: String }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Department found',
        type: DepartmentResponse,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Department not found',
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied. HR role required',
      }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update department' }),
      ApiParam({ name: 'id', description: 'Department UUID', type: String }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Department updated successfully',
        type: DepartmentResponse,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Department not found',
      }),
      ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Department with this name already exists',
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied. HR role required',
      }),
    ),

  delete: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete department' }),
      ApiParam({ name: 'id', description: 'Department UUID', type: String }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Department deleted successfully',
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Department not found',
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied. HR role required',
      }),
    ),
};
