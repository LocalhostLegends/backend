import { ApiProperty } from '@nestjs/swagger';

import { AvatarFields } from '@modules/core/users/swagger/avatar.fields';

export class AvatarUploadResponseDto {
  @ApiProperty(AvatarFields.success)
  success: boolean;

  @ApiProperty(AvatarFields.avatar)
  avatar: string;

  @ApiProperty(AvatarFields.message)
  message: string;
}
