import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AvatarSchema } from './avatar.schema';

export const AvatarSwagger = {
  upload: () =>
    applyDecorators(
      ApiOperation({ summary: 'Upload or update user avatar' }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            avatar: {
              type: 'string',
              format: 'binary',
              description: 'Image file (jpg, png, webp)',
            },
          },
        },
      }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Avatar uploaded successfully',
        type: AvatarSchema.uploadResponse,
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'No file uploaded or invalid file format',
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
    ),

  delete: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete user avatar' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Avatar deleted successfully',
        type: AvatarSchema.deleteResponse,
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
      }),
    ),
};
