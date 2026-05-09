import { ApiProperty } from '@nestjs/swagger';

import { AuthFields } from '@modules/core/auth/swagger/auth.fields';
import { UserResponseDto } from '@modules/core/users/dto/user-response.dto';

export class AccessTokenResponseDto {
  @ApiProperty(AuthFields.accessToken)
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
