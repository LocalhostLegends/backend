import { Injectable } from '@nestjs/common';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { User } from '@database/entities/user.entity';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserStatus } from '@database/entities/user.entity.enums';

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
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    // Filter by multiple roles
    if (filters.roles && filters.roles.length > 0) {
      queryBuilder.andWhere('user.role IN (:...roles)', { roles: filters.roles });
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

    // Filter users with expired activation tokens
    if (filters.expiredInvitationsOnly) {
      queryBuilder.andWhere(
        'user.status = :invitedStatus AND user.activationTokenExpiresAt < :now',
        {
          invitedStatus: UserStatus.INVITED,
          now: new Date(),
        },
      );
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

  // Helper method for company-specific filtering
  applyCompanyFilter(
    queryBuilder: SelectQueryBuilder<User>,
    companyId: string,
  ): SelectQueryBuilder<User> {
    return queryBuilder.andWhere('user.companyId = :companyId', { companyId });
  }

  // Helper method for role-based access control
  applyRoleBasedAccess(
    queryBuilder: SelectQueryBuilder<User>,
    currentUserRole: string,
    currentUserId: string,
  ): SelectQueryBuilder<User> {
    switch (currentUserRole) {
      case 'ADMIN':
        // Admin can see all users in their company
        // No additional restrictions
        break;
      case 'HR':
        // HR cannot see ADMIN users
        queryBuilder.andWhere('user.role != :adminRole', { adminRole: 'ADMIN' });
        break;
      case 'EMPLOYEE':
        // Employee can only see themselves
        queryBuilder.andWhere('user.id = :userId', { userId: currentUserId });
        break;
    }
    return queryBuilder;
  }

  // Helper method to filter users by department chain (including sub-departments)
  applyDepartmentHierarchyFilter(
    queryBuilder: SelectQueryBuilder<User>,
    departmentIds: string[],
  ): SelectQueryBuilder<User> {
    if (departmentIds && departmentIds.length > 0) {
      queryBuilder.andWhere('user.departmentId IN (:...departmentIds)', { departmentIds });
    }
    return queryBuilder;
  }

  // Helper method for advanced search with multiple fields
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

  // Helper method to filter users by status with optional expiry check
  applyStatusFilterWithExpiry(
    queryBuilder: SelectQueryBuilder<User>,
    status: UserStatus,
    checkExpiry: boolean = false,
  ): SelectQueryBuilder<User> {
    queryBuilder.andWhere('user.status = :status', { status });

    if (checkExpiry && status === UserStatus.INVITED) {
      queryBuilder.andWhere('user.activationTokenExpiresAt > :now', { now: new Date() });
    }

    return queryBuilder;
  }

  // Helper method to add joins based on filters
  applyOptimizedJoins(
    queryBuilder: SelectQueryBuilder<User>,
    filters: UserFilterDto,
  ): SelectQueryBuilder<User> {
    // Always join company for tenant isolation
    queryBuilder.leftJoinAndSelect('user.company', 'company');

    // Join department only if needed for filtering or selection
    if (filters.departmentId || filters.sortBy === 'department') {
      queryBuilder.leftJoinAndSelect('user.department', 'department');
    }

    // Join position only if needed for filtering or selection
    if (filters.positionId || filters.sortBy === 'position') {
      queryBuilder.leftJoinAndSelect('user.position', 'position');
    }

    return queryBuilder;
  }
}