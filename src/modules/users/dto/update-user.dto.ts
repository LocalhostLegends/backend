import { IsEmail, IsString, MaxLength, IsOptional, IsUUID, Matches } from 'class-validator';

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