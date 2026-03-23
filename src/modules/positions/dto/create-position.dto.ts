import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    example: 'Senior Developer',
    description: 'Position title',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Position title must be a string' })
  @MinLength(2, { message: 'Position title must be at least 2 characters long' })
  @MaxLength(100, { message: 'Position title must not exceed 100 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'Senior software developer position',
    description: 'Position description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}