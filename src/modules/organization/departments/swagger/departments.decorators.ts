import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DepartmentResponseDto } from '../dto/department-response.dto';
import { DepartmentFields } from './department.fields';

export const ApiDepartmentTags = () => ApiTags('Departments');

// POST /departments - create
export const ApiCreateDepartment = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new department in the current company' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Department created successfully',
      type: DepartmentResponseDto,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Department with this name already exists in the current company',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// GET /departments - findAll
export const ApiFindAllDepartments = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all departments in the current company' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of departments in the current company',
      type: [DepartmentResponseDto],
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// GET /departments/:id - findOne
export const ApiFindOneDepartment = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get department by ID' }),
    ApiParam({
      name: 'id',
      description: 'Department UUID',
      type: String,
      example: DepartmentFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Department found',
      type: DepartmentResponseDto,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid department ID' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Department not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// PATCH /departments/:id - update
export const ApiUpdateDepartment = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update department' }),
    ApiParam({
      name: 'id',
      description: 'Department UUID',
      type: String,
      example: DepartmentFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Department updated successfully',
      type: DepartmentResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error or invalid department ID',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Department not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Department with this name already exists in the current company',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// DELETE /departments/:id - remove
export const ApiRemoveDepartment = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete department' }),
    ApiParam({
      name: 'id',
      description: 'Department UUID',
      type: String,
      example: DepartmentFields.id.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Department deleted successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid department ID' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Department not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};
