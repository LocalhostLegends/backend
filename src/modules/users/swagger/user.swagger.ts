import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { UserResponse } from './user.schema';

export const SwaggerCreateUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully', type: UserResponse }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};

export const SwaggerFindAllUsers = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of users', type: [UserResponse] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};

export const SwaggerFindOneUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by ID' }),
    ApiParam({ name: 'id', description: 'User UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'User found', type: UserResponse }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const SwaggerUpdateUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update user' }),
    ApiParam({ name: 'id', description: 'User UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', type: UserResponse }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const SwaggerDeleteUser = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user' }),
    ApiParam({ name: 'id', description: 'User UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};