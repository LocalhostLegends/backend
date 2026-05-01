import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { UserResponseDto } from '../dto/user-response.dto';
import { AvatarUploadResponseDto } from '../dto/avatar-upload-response.dto';
import { AvatarDeleteResponseDto } from '../dto/avatar-delete-response.dto';

export const ApiUserTags = () => ApiTags('Users');

// GET /users - findAll
export const ApiFindAllUsers = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all users with pagination and filters' }),
    ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] }),
  );
};

// GET /users/me - getCurrentUser
export const ApiGetCurrentUser = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get current user profile' }),
    ApiResponse({ status: HttpStatus.OK, type: UserResponseDto }),
  );
};

// GET /users/role/:role - getUsersByRole
export const ApiGetUsersByRole = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get users by role' }),
    ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] }),
  );
};

// GET /users/status/:status - getUsersByStatus
export const ApiGetUsersByStatus = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get users by status' }),
    ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] }),
  );
};

// GET /users/:id - findOne
export const ApiFindOneUser = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get user by ID' }),
    ApiResponse({ status: HttpStatus.OK, type: UserResponseDto }),
  );
};

// PATCH /users/:id - update
export const ApiUpdateUser = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update user' }),
    ApiResponse({ status: HttpStatus.OK, type: UserResponseDto }),
  );
};

// POST /users/:id/block - blockUser
export const ApiBlockUser = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Block user (ADMIN only)' }),
    ApiResponse({ status: HttpStatus.OK, type: UserResponseDto }),
  );
};

// POST /users/:id/unblock - unblockUser
export const ApiUnblockUser = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Unblock user (ADMIN only)' }),
    ApiResponse({ status: HttpStatus.OK, type: UserResponseDto }),
  );
};

// DELETE /users/:id - remove
export const ApiRemoveUser = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete user (soft delete)' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully' }),
  );
};

// POST /users/me/avatar - upload avatar
export const ApiUploadAvatar = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Upload user avatar' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          avatar: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Avatar uploaded successfully',
      type: AvatarUploadResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'No file uploaded or invalid file',
    }),
  );
};

// DELETE /users/me/avatar - delete avatar
export const ApiDeleteAvatar = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete user avatar' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avatar deleted successfully',
      type: AvatarDeleteResponseDto,
    }),
  );
};
