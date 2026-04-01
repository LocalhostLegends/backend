import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'IT Department',
    description: 'Department name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Department name must be a string' })
  @MinLength(2, {
    message: 'Department name must be at least 2 characters long',
  })
  @MaxLength(100, { message: 'Department name must not exceed 100 characters' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Information Technology department',
    description: 'Department description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
