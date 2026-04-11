import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { AuthSchema } from './auth.schema';

import { UserResponse } from '../../users/swagger/user.schema';

export const AuthSwagger = {
  register: () =>
    applyDecorators(
      ApiOperation({ summary: 'Register a new user' }),
      ApiBody({ type: AuthSchema.registerBody }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User registered successfully',
        type: UserResponse,
      }),
      ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User with this email already exists',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    ),

  login: () =>
    applyDecorators(
      ApiOperation({ summary: 'Login with email and password' }),
      ApiBody({ type: AuthSchema.loginBody }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Login successful, refresh token set in cookie',
        type: AuthSchema.response,
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    ),

  refresh: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Refresh access token using refresh token cookie',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'New access token returned',
        type: AuthSchema.response,
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or expired refresh token',
      }),
    ),
};
