import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export const IsBooleanQuery = () =>
  applyDecorators(
    Type(() => Boolean),
    IsBoolean(),
  );

export const IsDateQuery = () =>
  applyDecorators(
    Type(() => Date),
    IsDate(),
  );

export const IsPassword = () => applyDecorators(IsNotEmpty(), IsString(), MinLength(6));

export const IsPhone = () =>
  applyDecorators(
    IsString(),
    Matches(/^[+0-9\s()-]+$/, {
      message: 'Phone number can only contain +, digits, spaces, hyphens, and parentheses',
    }),
  );
