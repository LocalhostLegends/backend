import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ValidateInviteDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsNotEmpty()
  @IsUUID()
  token: string;
}
