import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString({ message: 'Position title must be a string' })
  @MinLength(2, { message: 'Position title must be at least 2 characters long' })
  @MaxLength(100, { message: 'Position title must not exceed 100 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}