import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { SortOrder } from '../enums/sort-order.enum';
import { PaginationQueryFields } from '../swagger/pagination-query.fields';
import {
  IsPaginationLimit,
  IsPaginationPage,
  IsPaginationSortOrder,
} from '../decorators/pagination-fields.decorators';

export class PaginationQueryDto {
  @ApiPropertyOptional(PaginationQueryFields.page)
  @IsOptional()
  @IsPaginationPage()
  page?: number = 1;

  @ApiPropertyOptional(PaginationQueryFields.limit)
  @IsOptional()
  @IsPaginationLimit()
  limit?: number = 10;

  @ApiPropertyOptional(PaginationQueryFields.sortBy)
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional(PaginationQueryFields.sortOrder)
  @IsOptional()
  @IsPaginationSortOrder()
  sortOrder?: SortOrder = SortOrder.DESC;
}
