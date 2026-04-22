import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

import { SortOrder } from '@common/enums/sort-order.enum';

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

export const IsPaginationPage = () =>
  applyDecorators(
    Type(() => Number),
    IsInt(),
    Min(1),
  );

export const IsPaginationLimit = () =>
  applyDecorators(
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
  );

export const IsPaginationSortOrder = () => applyDecorators(IsEnum(SortOrder));
