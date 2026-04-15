import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateHrDto {
  @ApiProperty({ example: 'hr@techcorp.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
