import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { IsPassword } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';
import { AuthFields } from '@modules/core/auth/swagger/auth.fields';

export class ActivateUserDto {
  @ApiProperty(AuthFields.activationToken)
  @IsUUID()
  token: string;

  @ApiProperty(CommonFields.password)
  @IsPassword()
  password: string;
}
