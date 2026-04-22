import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsPaginationLimit,
  IsPaginationPage,
  IsPaginationSortOrder,
} from '@common/decorators/common-fields.decorators';
import { SortOrder } from '@/common/enums/sort-order.enum';
import { PaginationQueryFields } from '@common/swagger/pagination-query.fields';

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
