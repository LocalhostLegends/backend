import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { CreatePositionDto } from './create-position.dto';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}