import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const IsCompanyName = () => applyDecorators(IsNotEmpty(), IsString(), MaxLength(200));
