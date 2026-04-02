import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateHrDto {
  @ApiProperty({ example: 'Jane', description: 'First name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'hr@techcorp.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}