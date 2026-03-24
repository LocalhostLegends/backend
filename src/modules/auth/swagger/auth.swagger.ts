import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthResponseSchema, RegisterBodySchema, LoginBodySchema } from './auth.schema';
import { UserResponse } from '@modules/users/swagger/user.schema';

export const SwaggerRegister = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterBodySchema }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully', type: UserResponse }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
  );
};

export const SwaggerLogin = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login with email and password' }),
    ApiBody({ type: LoginBodySchema }),
    ApiResponse({ status: HttpStatus.OK, description: 'Login successful, refresh token set in cookie', type: AuthResponseSchema }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
  );
};

export const SwaggerRefresh = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token using refresh token cookie' }),
    ApiResponse({ status: HttpStatus.OK, description: 'New access token returned', type: AuthResponseSchema }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or expired refresh token' }),
  );
};