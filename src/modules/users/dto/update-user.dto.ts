import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, IsOptional, IsUUID, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional({ example: '+380501234567' })
  @IsOptional()
  @IsString()
  @Matches(/^[\+\d\s\-\(\)]+$/, {
    message: 'Phone number can only contain +, digits, spaces, hyphens, and parentheses'
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}