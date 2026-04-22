import { applyDecorators } from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';

export const IsPositionTitle = () => applyDecorators(IsString(), MinLength(2), MaxLength(100));

export const IsPositionDescription = () => applyDecorators(IsString(), MaxLength(500));
