import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessTokenResponseDto } from '../dto/access-token-response.dto';

export const ApiAuthTags = () => ApiTags('Auth');

// POST /auth/register-company
export const ApiRegisterCompany = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new company with admin user' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Company and admin created successfully',
      type: AccessTokenResponseDto,
    }),
  );
};

// POST /auth/login
export const ApiLogin = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login successful',
      type: AccessTokenResponseDto,
    }),
  );
};

// POST /auth/refresh
export const ApiRefreshToken = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Refresh access token' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Tokens refreshed successfully',
      type: AccessTokenResponseDto,
    }),
  );
};

// POST /auth/logout
export const ApiLogout = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Logout user' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' }),
  );
};

// POST /auth/forgot-password
export const ApiForgotPassword = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Forgot Password (Request Reset Link)',
      description:
        'Sends a reset link to the user email. Used for both forgotten passwords and security-mandated resets from profile.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Reset link sent if user exists and is active',
    }),
  );
};

// POST /auth/reset-password
export const ApiResetPassword = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password using token' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Password reset successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Invalid or expired token',
    }),
  );
};
