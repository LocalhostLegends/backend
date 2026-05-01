import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import config from '@config/app.config';
import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { Company } from '@database/entities/company.entity';
import { UserStatus } from '@common/enums/user-status.enum';
import { TokenType } from '@common/enums/token-type.enum';
import { InviteStatus } from '@common/enums/invite-status.enum';
import { Invite } from '@database/entities/invite.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { type AuthorizedUser } from '@modules/core/users/users.types';
import { PaginationService } from '@modules/pagination/pagination.service';
import { PaginatedResult } from '@modules/pagination/pagination.interfaces';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserFilterBuilder } from './user-filter.builder';

import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';

import { Role } from '@database/entities/role.entity';

@Injectable()
export class UsersService {
  private readonly _permissionsVersionCache = new Map<
    string,
    { version: number; expires: number }
  >();

  constructor(
    @InjectRepository(User) private readonly _usersRepository: Repository<User>,
    @InjectRepository(Company) private readonly _companyRepository: Repository<Company>,
    @InjectRepository(Department) private readonly _departmentRepository: Repository<Department>,
    @InjectRepository(Position) private readonly _positionRepository: Repository<Position>,
    @InjectRepository(Invite) private readonly _inviteRepository: Repository<Invite>,
    @InjectRepository(Role) private readonly _roleRepository: Repository<Role>,
    private readonly _paginationService: PaginationService,
    private readonly _userFilterBuilder: UserFilterBuilder,
    private readonly _emailService: EmailService,
    private readonly _tokenService: TokenService,
    private readonly _permissions: PermissionsService,
  ) {}

  /**
   * Gets the user's permissions version.
   * Uses a local cache for optimization.
   * TODO: When scaling to multiple instances, replace Map with Redis.
   */
  async getPermissionsVersion(userId: string, forceRefresh = false): Promise<number> {
    const now = Date.now();

    if (!forceRefresh) {
      const cached = this._permissionsVersionCache.get(userId);
      if (cached && cached.expires > now) {
        return cached.version;
      }
    }

    const user = await this._usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'permissionsVersion'],
    });

    const version = user?.permissionsVersion ?? 0;

    this._permissionsVersionCache.set(userId, {
      version,
      expires: now + 15 * 1000,
    });

    return version;
  }

  clearPermissionsVersionCache(userId: string): void {
    this._permissionsVersionCache.delete(userId);
  }

  async incrementPermissionsVersion(userId: string): Promise<void> {
    await this._usersRepository.increment({ id: userId }, 'permissionsVersion', 1);
    this.clearPermissionsVersionCache(userId);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this._roleRepository
      .createQueryBuilder('role')
      .innerJoin('user_roles', 'ur', 'ur.role_id = role.id')
      .innerJoinAndSelect('role.permissions', 'permission')
      .where('ur.user_id = :userId', { userId })
      .getMany();

    const permissions = new Set<string>();
    roles.forEach((role) => {
      role.permissions?.forEach((p) => permissions.add(p.action));
    });

    return Array.from(permissions);
  }

  async create(createUserDto: CreateUserDto, currentUser?: AuthorizedUser): Promise<User> {
    const companyId = currentUser?.companyId || createUserDto.companyId;

    if (!companyId) {
      throw ExceptionFactory.commonRequiredField('Company ID');
    }

    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.USER_CREATE, {
        companyId,
        departmentId: createUserDto.departmentId,
      });
    }

    await this._ensureEmailUniqueInCompany(createUserDto.email, companyId);

    const company = await this._findCompanyById(companyId);

    let department: Department | null = null;
    if (createUserDto.departmentId) {
      department = await this._findDepartmentById(createUserDto.departmentId, companyId);
    }

    let position: Position | null = null;
    if (createUserDto.positionId) {
      position = await this._findPositionById(createUserDto.positionId, companyId);
    }

    const role = createUserDto.role || UserRole.EMPLOYEE;
    const hasPassword = !!createUserDto.password;

    const userData: Partial<User> = {
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      company,
      department,
      position,
      phone: createUserDto.phone || null,
      role,
      status: hasPassword ? UserStatus.ACTIVE : UserStatus.INVITED,
      createdBy: currentUser?.id || null,
      metadata: {
        invitedBy: currentUser?.id,
        invitedAt: new Date(),
        source: 'manual',
      },
    };

    if (hasPassword) {
      userData.password = await this._hashPassword(createUserDto.password!);
      userData.emailVerifiedAt = new Date();
    }

    const user = this._usersRepository.create(userData);
    const savedUser = await this._usersRepository.save(user);

    if (createUserDto.sendInvitation && !hasPassword) {
      await this._createAndSendInvitation(savedUser);
    }

    return this.findById(savedUser.id);
  }

  async createInvitedUser(
    firstName: string,
    lastName: string,
    email: string,
    role: UserRole,
    companyId: string,
    createdBy?: string,
  ): Promise<User> {
    await this._ensureEmailUniqueInCompany(email, companyId);

    const company = await this._findCompanyById(companyId);

    const user = this._usersRepository.create({
      firstName,
      lastName,
      email,
      role,
      status: UserStatus.INVITED,
      company,
      createdBy: createdBy || null,
      metadata: {
        invitedBy: createdBy,
        invitedAt: new Date(),
        source: 'invite',
      },
    });

    const savedUser = await this._usersRepository.save(user);
    await this._createAndSendInvitation(savedUser);

    return savedUser;
  }

  async findAllPaginated(
    filters: UserFilterDto,
    currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<User>> {
    const queryBuilder = this._usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.company', 'company')
      .where('user.company_id = :companyId', { companyId: currentUser.companyId });

    this._userFilterBuilder.buildFilters(queryBuilder, filters);

    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'DESC';
    this._userFilterBuilder.applySorting(queryBuilder, sortBy, sortOrder);

    this._applyRoleBasedAccess(queryBuilder, currentUser);

    if (!filters.withDeleted) {
      queryBuilder.andWhere('user.deletedAt IS NULL');
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    return this._paginationService.paginate(queryBuilder, page, limit);
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<User> {
    const user = await this.findById(id);
    await this._permissions.assertCan(currentUser, PermissionAction.USER_READ, user);
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({
      where: { id },
      relations: ['company', 'department', 'position'],
    });

    if (!user) {
      throw ExceptionFactory.userWithIdNotFound(id);
    }

    return user;
  }

  async findByEmail(
    email: string,
    companyId?: string,
    includePassword: boolean = false,
  ): Promise<User | null> {
    const queryBuilder = this._usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.position', 'position')
      .where('user.email = :email', { email });

    if (companyId) {
      queryBuilder.andWhere('user.company_id = :companyId', { companyId });
    }

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    return queryBuilder.getOne();
  }

  async findFirstAdmin(): Promise<User | null> {
    return this._usersRepository.findOne({
      where: {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      relations: ['company'],
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: AuthorizedUser,
  ): Promise<User> {
    const user = await this.findById(id);

    await this._permissions.assertCan(currentUser, PermissionAction.USER_UPDATE, {
      ...user,
      ...updateUserDto,
    });

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this._ensureEmailUniqueInCompany(updateUserDto.email, currentUser.companyId);
    }

    const updateData: Partial<User> = {};

    if (updateUserDto.firstName !== undefined) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;
    if (updateUserDto.avatar !== undefined) updateData.avatar = updateUserDto.avatar;

    if (currentUser.role === UserRole.ADMIN) {
      if (updateUserDto.role !== undefined && updateUserDto.role !== user.role) {
        if (user.id === currentUser.id) {
          throw ExceptionFactory.forbidden();
        }
        updateData.role = updateUserDto.role;
        await this.incrementPermissionsVersion(user.id);
      }

      if (updateUserDto.status !== undefined && updateUserDto.status !== user.status) {
        if (user.id === currentUser.id && updateUserDto.status === UserStatus.BLOCKED) {
          throw ExceptionFactory.forbidden();
        }
        updateData.status = updateUserDto.status;
        await this.incrementPermissionsVersion(user.id);
      }
    }

    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.HR) {
      if (updateUserDto.departmentId !== undefined) {
        if (updateUserDto.departmentId === null) {
          updateData.department = null;
        } else {
          const department = await this._findDepartmentById(
            updateUserDto.departmentId,
            currentUser.companyId,
          );
          updateData.department = department;
        }
      }

      if (updateUserDto.positionId !== undefined) {
        if (updateUserDto.positionId === null) {
          updateData.position = null;
        } else {
          const position = await this._findPositionById(
            updateUserDto.positionId,
            currentUser.companyId,
          );
          updateData.position = position;
        }
      }
    }

    updateData.updatedBy = currentUser.id;

    const updatedUser = this._usersRepository.merge(user, updateData);
    return this._usersRepository.save(updatedUser);
  }

  async remove(id: string, currentUser: AuthorizedUser): Promise<void> {
    const user = await this.findOne(id, currentUser);

    if (user.id === currentUser.id) {
      throw ExceptionFactory.forbidden();
    }

    await this._permissions.assertCan(currentUser, PermissionAction.USER_DELETE, user);

    await this._tokenService.revokeUserTokens(id);
    await this._usersRepository.softDelete(id);
  }

  async activateUser(token: string, password: string, _ip?: string): Promise<User> {
    const invite = await this._inviteRepository.findOne({
      where: { token },
      relations: ['company'],
    });

    if (!invite) {
      throw ExceptionFactory.invalidToken();
    }

    const department = invite.departmentId
      ? await this._findDepartmentById(invite.departmentId, invite.company.id)
      : null;

    const position = invite.positionId
      ? await this._findPositionById(invite.positionId, invite.company.id)
      : null;

    let user = await this._usersRepository.findOne({
      where: { email: invite.email, company: { id: invite.company.id } },
    });

    if (!user) {
      user = this._usersRepository.create({
        email: invite.email,
        firstName: 'Firstname',
        lastName: 'Lastname',
        role: invite.role as UserRole,
        status: UserStatus.INVITED,
        company: invite.company,
        metadata: {
          invitedBy: invite.invitedBy?.id,
          invitedAt: new Date(),
          source: 'invite',
        },
      });
      user = await this._usersRepository.save(user);
    }

    if (department) {
      user.department = department;
    }

    if (position) {
      user.position = position;
    }

    user.password = await this._hashPassword(password);
    user.status = UserStatus.ACTIVE;
    user.emailVerifiedAt = new Date();

    const savedUser = await this._usersRepository.save(user);

    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    await this._inviteRepository.save(invite);

    await this._tokenService.revokeToken(token);

    return this.findById(savedUser.id);
  }

  async blockUser(id: string, currentUser: AuthorizedUser): Promise<User> {
    const user = await this.findOne(id, currentUser);

    if (user.id === currentUser.id) {
      throw ExceptionFactory.forbidden();
    }

    await this._permissions.assertCan(currentUser, PermissionAction.USER_UPDATE, user);

    user.status = UserStatus.BLOCKED;

    await this._tokenService.revokeUserTokens(id);
    return this._usersRepository.save(user);
  }

  async unblockUser(id: string, currentUser: AuthorizedUser): Promise<User> {
    const user = await this.findOne(id, currentUser);
    await this._permissions.assertCan(currentUser, PermissionAction.USER_UPDATE, user);
    user.status = UserStatus.ACTIVE;
    user.resetFailedLoginAttempts();
    return this._usersRepository.save(user);
  }

  async getUsersByRole(currentUser: AuthorizedUser, role: UserRole): Promise<User[]> {
    await this._permissions.assertCan(currentUser, PermissionAction.USER_READ);
    const queryBuilder = this._usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.position', 'position')
      .where('user.company_id = :companyId', { companyId: currentUser.companyId })
      .andWhere('user.role = :role', { role })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('user.deletedAt IS NULL');

    this._applyRoleBasedAccess(queryBuilder, currentUser);

    return queryBuilder.getMany();
  }

  async getCompanyUsers(companyId: string): Promise<User[]> {
    return this._usersRepository.find({
      where: { company: { id: companyId }, deletedAt: IsNull() },
      relations: ['department', 'position'],
    });
  }

  async updateLastLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string | null,
  ): Promise<void> {
    await this._usersRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress ?? null,
      lastLoginUserAgent: userAgent ?? null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.incrementFailedLoginAttempts();
    user.lastFailedLoginAt = new Date();
    await this._usersRepository.save(user);
  }

  private async _ensureEmailUniqueInCompany(email: string, companyId: string): Promise<void> {
    const user = await this._usersRepository.findOne({
      where: { email, company: { id: companyId }, deletedAt: IsNull() },
    });

    if (user) {
      throw ExceptionFactory.userEmailExists(email);
    }
  }

  private async _findCompanyById(id: string): Promise<Company> {
    const company = await this._companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw ExceptionFactory.companyWithIdNotFound(id);
    }

    return company;
  }

  private async _findDepartmentById(id: string, companyId: string): Promise<Department> {
    const department = await this._departmentRepository.findOne({
      where: { id, company: { id: companyId } },
    });

    if (!department) {
      throw ExceptionFactory.departmentNotFound(id);
    }

    return department;
  }

  private async _findPositionById(id: string, companyId: string): Promise<Position> {
    const position = await this._positionRepository.findOne({
      where: { id, company: { id: companyId } },
    });

    if (!position) {
      throw ExceptionFactory.positionNotFound(id);
    }

    return position;
  }

  private _applyRoleBasedAccess(
    queryBuilder: SelectQueryBuilder<User>,
    currentUser: AuthorizedUser,
  ): void {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        break;
      case UserRole.HR:
        queryBuilder.andWhere('user.role != :adminRole', { adminRole: UserRole.ADMIN });
        break;
      case UserRole.MANAGER:
        if (currentUser.departmentId) {
          queryBuilder.andWhere('user.department_id = :deptId', {
            deptId: currentUser.departmentId,
          });
          queryBuilder.andWhere('user.role NOT IN (:...highRoles)', {
            highRoles: [UserRole.ADMIN, UserRole.HR],
          });
        } else {
          queryBuilder.andWhere('1=0');
        }
        break;
      case UserRole.EMPLOYEE:
        queryBuilder.andWhere('user.id = :userId', { userId: currentUser.id });
        break;
    }
  }

  private async _createAndSendInvitation(user: User): Promise<void> {
    const token = await this._tokenService.createToken(
      user.id,
      TokenType.ACTIVATION,
      8, // 8 hours
    );

    const activationLink = `${config.frontend.url}/activate?token=${token.token}`;

    await this._emailService.sendInviteEmail(
      user.email,
      user.role,
      user.company.name,
      user.firstName,
      activationLink,
    );
  }

  private async _hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
