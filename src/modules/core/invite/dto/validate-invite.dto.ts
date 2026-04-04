import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateInviteDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsString()
  @IsNotEmpty()
  token: string;
}