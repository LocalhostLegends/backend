import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ActivateUserDto {
  @ApiProperty({ description: 'Activation token from email' })
  @IsNotEmpty()
  @IsUUID()
  token: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
