import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'Department name must be a string' })
  @MinLength(2, { message: 'Department name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Department name must not exceed 100 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}