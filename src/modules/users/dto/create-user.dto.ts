import {
  IsEmail, IsString, IsOptional,
  MinLength, MaxLength, IsUUID, Matches
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  positionId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\+\d\s\-\(\)]+$/, {
    message: 'Phone number can only contain +, digits, spaces, hyphens, and parentheses'
  })
  phone?: string;
}