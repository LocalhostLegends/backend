import { Injectable } from '@nestjs/common';
import type { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

import { PaginatedResult } from './pagination.interface';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
