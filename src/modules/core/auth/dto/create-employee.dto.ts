import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Bob', description: 'First name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Johnson', description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'employee@techcorp.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}