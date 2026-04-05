import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ActivateUserDto {
  @ApiProperty({ description: 'Activation token from email' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}