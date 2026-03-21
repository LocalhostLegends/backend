import {
  IsEmail, IsString, IsOptional,
  MinLength, MaxLength, IsEnum, IsUUID, Matches
} from 'class-validator';
import { UserRole } from '@database/entities/user.entity.enums';

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

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

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