import { SwaggerFieldsMap } from '@common/types/common.types';

export const AvatarFields = {
  success: {
    example: true,
    description: 'Operation success status',
  },
  avatar: {
    example: 'https://pub-xxx.r2.dev/users/test_test_com/avatar/abc123.jpg',
    description: 'URL of uploaded avatar',
  },
  message: {
    example: 'Avatar uploaded successfully',
    description: 'Operation result message',
  },
} as const satisfies SwaggerFieldsMap;
