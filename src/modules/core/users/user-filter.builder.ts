import { Injectable } from '@nestjs/common';
import { Brackets, SelectQueryBuilder } from 'typeorm';

import { User } from '@database/entities/user.entity';
import { UserStatus } from '@common/enums/user-status.enum';

import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UserFilterBuilder {
  buildFilters(
    queryBuilder: SelectQueryBuilder<User>,
    filters: UserFilterDto,
  ): SelectQueryBuilder<User> {
    // Search by firstName, lastName, email (case-insensitive)
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

    // Filter by role
    if (filters.role) {
      queryBuilder
        .innerJoin('user.roles', 'roleJoin')
        .andWhere('roleJoin.code = :roleCode', { roleCode: filters.role });
    }

    // Filter by multiple roles
    if (filters.roles && filters.roles.length > 0) {
      const alias = filters.role ? 'rolesJoinMulti' : 'roleJoin';
      if (filters.role) {
        queryBuilder
          .innerJoin('user.roles', alias)
          .andWhere(`${alias}.code IN (:...rolesCodes)`, { rolesCodes: filters.roles });
      } else {
        queryBuilder
          .innerJoin('user.roles', alias)
          .andWhere(`${alias}.code IN (:...rolesCodes)`, { rolesCodes: filters.roles });
      }
    }

    // Filter by status
    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }

    // Filter by multiple statuses
    if (filters.statuses && filters.statuses.length > 0) {
      queryBuilder.andWhere('user.status IN (:...statuses)', { statuses: filters.statuses });
    }

    // Filter by department
    if (filters.departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    // Filter by position
    if (filters.positionId) {
      queryBuilder.andWhere('user.positionId = :positionId', {
        positionId: filters.positionId,
      });
    }

    // Precise search by email
    if (filters.email) {
      queryBuilder.andWhere('user.email = :email', { email: filters.email });
    }

    // Filter by created date range
    if (filters.createdAfter) {
      queryBuilder.andWhere('user.createdAt >= :createdAfter', {
        createdAfter: filters.createdAfter,
      });
    }

    if (filters.createdBefore) {
      queryBuilder.andWhere('user.createdAt <= :createdBefore', {
        createdBefore: filters.createdBefore,
      });
    }

    // Special status filters (convenience helpers)
    if (filters.pendingOnly) {
      queryBuilder.andWhere('user.status = :pendingStatus', {
        pendingStatus: UserStatus.INVITED,
      });
    }

    if (filters.activeOnly) {
      queryBuilder.andWhere('user.status = :activeStatus', {
        activeStatus: UserStatus.ACTIVE,
      });
    }

    if (filters.blockedOnly) {
      queryBuilder.andWhere('user.status = :blockedStatus', {
        blockedStatus: UserStatus.BLOCKED,
      });
    }

    // Filter by company (for super admin scenarios)
    if (filters.companyId) {
      queryBuilder.andWhere('user.companyId = :companyId', {
        companyId: filters.companyId,
      });
    }

    // Handle soft-deleted records
    if (filters.withDeleted) {
      queryBuilder.withDeleted();
    } else {
      queryBuilder.andWhere('user.deletedAt IS NULL');
    }

    return queryBuilder;
  }

  applySorting(
    queryBuilder: SelectQueryBuilder<User>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): SelectQueryBuilder<User> {
    const allowedSortFields = [
      'firstName',
      'lastName',
      'email',
      'role',
      'status',
      'createdAt',
      'updatedAt',
    ];

    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    return queryBuilder;
  }

  applyCompanyFilter(
    queryBuilder: SelectQueryBuilder<User>,
    companyId: string,
  ): SelectQueryBuilder<User> {
    return queryBuilder.andWhere('user.companyId = :companyId', { companyId });
  }

  applyRoleBasedAccess(
    queryBuilder: SelectQueryBuilder<User>,
    currentUserRoles: string[],
    currentUserId: string,
  ): SelectQueryBuilder<User> {
    if (currentUserRoles.includes('ADMIN')) {
      return queryBuilder;
    }

    if (currentUserRoles.includes('HR')) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('ur.user_id')
          .from('user_roles', 'ur')
          .innerJoin('roles', 'r', 'r.id = ur.role_id')
          .where('r.code = :adminRole', { adminRole: 'ADMIN' })
          .getQuery();
        return `user.id NOT IN ${subQuery}`;
      });
      return queryBuilder;
    }

    if (currentUserRoles.includes('EMPLOYEE')) {
      queryBuilder.andWhere('user.id = :userId', { userId: currentUserId });
    }
    return queryBuilder;
  }

  applyDepartmentHierarchyFilter(
    queryBuilder: SelectQueryBuilder<User>,
    departmentIds: string[],
  ): SelectQueryBuilder<User> {
    if (departmentIds && departmentIds.length > 0) {
      queryBuilder.andWhere('user.departmentId IN (:...departmentIds)', { departmentIds });
    }
    return queryBuilder;
  }

  applyAdvancedSearch(
    queryBuilder: SelectQueryBuilder<User>,
    searchTerm: string,
    fields: ('firstName' | 'lastName' | 'email' | 'phone')[] = ['firstName', 'lastName', 'email'],
  ): SelectQueryBuilder<User> {
    if (!searchTerm) return queryBuilder;

    const searchPattern = `%${searchTerm}%`;

    queryBuilder.andWhere(
      new Brackets((qb) => {
        fields.forEach((field, index) => {
          const condition = `LOWER(user.${field}) LIKE LOWER(:searchTerm)`;
          if (index === 0) {
            qb.where(condition, { searchTerm: searchPattern });
          } else {
            qb.orWhere(condition, { searchTerm: searchPattern });
          }
        });
      }),
    );

    return queryBuilder;
  }

  applyStatusFilterWithExpiry(
    queryBuilder: SelectQueryBuilder<User>,
    status: UserStatus,
  ): SelectQueryBuilder<User> {
    return queryBuilder.andWhere('user.status = :status', { status });
  }

  applyOptimizedJoins(
    queryBuilder: SelectQueryBuilder<User>,
    filters: UserFilterDto,
  ): SelectQueryBuilder<User> {
    queryBuilder.leftJoinAndSelect('user.company', 'company');

    if (filters.departmentId || filters.sortBy === 'department') {
      queryBuilder.leftJoinAndSelect('user.department', 'department');
    }

    if (filters.positionId || filters.sortBy === 'position') {
      queryBuilder.leftJoinAndSelect('user.position', 'position');
    }

    return queryBuilder;
  }
}
