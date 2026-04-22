import { ApiProperty } from '@nestjs/swagger';

import { AuthFields } from '@modules/core/auth/swagger/auth.fields';

export class AccessTokenResponseDto {
  @ApiProperty(AuthFields.accessToken)
  accessToken: string;
}
