import { ApiProperty } from '@nestjs/swagger';

export class AvatarUploadResponseSchema {
  @ApiProperty({ example: 'https://pub-xxx.r2.dev/users/test_test_com/avatar/abc123.jpg', description: 'URL of uploaded avatar' })
  avatar: string;
}

export class AvatarDeleteResponseSchema {
  @ApiProperty({ example: 'Avatar deleted', description: 'Success message' })
  message: string;
}

export const AvatarSchema = {
  uploadResponse: AvatarUploadResponseSchema,
  deleteResponse: AvatarDeleteResponseSchema,
};