import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { CommonFields } from '@common/swagger/common.fields';

export class ForgotPasswordDto {
  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;
}
