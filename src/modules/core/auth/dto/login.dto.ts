import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsBoolean } from 'class-validator';

import { IsPassword } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';

export class LoginDto {
  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;

  @ApiProperty(CommonFields.password)
  @IsPassword()
  password: string;

  @ApiProperty({
    description: 'Whether to remember the user for a long-lived session',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
