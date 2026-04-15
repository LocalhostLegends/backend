import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'employee@techcorp.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
