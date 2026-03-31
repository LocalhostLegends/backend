import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { UserRole } from '@database/entities/user.entity.enums';

import { UserResponse } from './user.schema'

export const UserSwagger = {
  findAll: () => applyDecorators(
    ApiOperation({
      summary: 'Get all users with pagination and filters',
      description: 'Returns paginated list of users. HR sees all users, regular users see only their own profile.'
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of users with pagination metadata',
      schema: {
        example: {
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174000',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'employee',
            phone: '+1234567890',
            avatar: null,
            department: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Engineering', description: 'Software Engineering department' },
            position: { id: '123e4567-e89b-12d3-a456-426614174000', title: 'Software Engineer', description: 'Develops software' },
          }],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 25,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: false
          }
        }
      }
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (max 100)' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt', description: 'Sort field: firstName, lastName, email, role, createdAt, updatedAt' }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC', description: 'Sort order' }),
    ApiQuery({ name: 'search', required: false, type: String, example: 'John', description: 'Search by firstName, lastName, or email' }),
    ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by user role' }),
    ApiQuery({ name: 'departmentId', required: false, type: String, description: 'Filter by department ID' }),
    ApiQuery({ name: 'positionId', required: false, type: String, description: 'Filter by position ID' }),
    ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by exact email' }),
  ),

  findOne: () => applyDecorators(
    ApiOperation({ summary: 'Get user by ID' }),
    ApiParam({ name: 'id', description: 'User UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'User found', type: UserResponse }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
  ),

  update: () => applyDecorators(
    ApiOperation({ summary: 'Update user' }),
    ApiParam({ name: 'id', description: 'User UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', type: UserResponse }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
  ),

  delete: () => applyDecorators(
    ApiOperation({
      summary: 'Soft delete user',
      description: 'User can delete only themselves. HR can delete anyone.'
    }),
    ApiParam({ name: 'id', description: 'User UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'This endpoint requires hr role or ownership of the resource' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
  ),
};