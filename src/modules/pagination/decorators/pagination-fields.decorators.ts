import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

import { SortOrder } from '../enums/sort-order.enum';

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
