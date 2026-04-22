import { ApiProperty } from '@nestjs/swagger';

import { AvatarFields } from '@modules/core/users/swagger/avatar.fields';

export class AvatarDeleteResponseDto {
  @ApiProperty(AvatarFields.success)
  success: boolean;

  @ApiProperty({
    ...AvatarFields.message,
    example: 'Avatar deleted successfully',
  })
  message: string;
}
