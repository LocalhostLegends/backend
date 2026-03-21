import { IsEmail, IsString, MaxLength, IsOptional, IsEnum, IsUUID, Matches } from 'class-validator';
import { UserRole } from '@database/entities/user.entity.enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
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