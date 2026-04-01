import { Injectable } from '@nestjs/common';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { User } from '@database/entities/user.entity';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UserFilterBuilder {
  buildFilters(
    queryBuilder: SelectQueryBuilder<User>,
    filters: UserFilterDto,
  ): SelectQueryBuilder<User> {
    // by firstName, lastName, email
    if (filters.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.firstName) LIKE LOWER(:search)', {
            search: `%${filters.search}%`,
          })
            .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            })
            .orWhere('LOWER(user.email) LIKE LOWER(:search)', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }

    // by role
    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    // by department
    if (filters.departmentId) {
      queryBuilder.andWhere('department.id = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    // by position
    if (filters.positionId) {
      queryBuilder.andWhere('position.id = :positionId', {
        positionId: filters.positionId,
      });
    }

    // precise search by email
    if (filters.email) {
      queryBuilder.andWhere('user.email = :email', { email: filters.email });
    }

    return queryBuilder;
  }

  applySorting(
    queryBuilder: SelectQueryBuilder<User>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): SelectQueryBuilder<User> {
    const allowedSortFields = ['firstName', 'lastName', 'email', 'role', 'createdAt', 'updatedAt'];

    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    return queryBuilder;
  }
}
