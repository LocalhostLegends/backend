import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

import { CommonFields } from '@common/swagger/common.fields';

export class CreateHrDto {
  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;
}
