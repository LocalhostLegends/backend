import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

import { IsPassword } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';

export class LoginDto {
  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;

  @ApiProperty(CommonFields.password)
  @IsPassword()
  password: string;
}
