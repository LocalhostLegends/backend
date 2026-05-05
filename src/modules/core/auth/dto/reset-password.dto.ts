import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { IsPassword } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The reset token received via email',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty(CommonFields.password)
  @IsPassword()
  newPassword: string;
}
