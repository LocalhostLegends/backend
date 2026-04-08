import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { Company } from '@database/entities/company.entity';
import { UserStatus } from '@database/enums/user-status.enum';
import { TokenType } from '@database/enums/token-type.enum';
import { InviteStatus } from '@database/enums/invite-status.enum';
import { Invite } from '@database/entities/invite.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@common/types/authorized-user.type';
import { PaginationService } from '@common/pagination/pagination.service';
import { PaginatedResult } from '@common/pagination/pagination.interface';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserFilterBuilder } from './user-filter.builder';

import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepository: Repository<User>,
    // @InjectRepository(Token) private readonly _tokenRepository: Repository<Token>,
    @InjectRepository(Company) private readonly _companyRepository: Repository<Company>,
    @InjectRepository(Department) private readonly _departmentRepository: Repository<Department>,
    @InjectRepository(Position) private readonly _positionRepository: Repository<Position>,
    @InjectRepository(Invite) private readonly _inviteRepository: Repository<Invite>,
    private readonly _paginationService: PaginationService,
    private readonly _userFilterBuilder: UserFilterBuilder,
    private readonly _emailService: EmailService,
    private readonly _tokenService: TokenService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: AuthorizedUser): Promise<User> {
    const companyId = currentUser?.companyId || createUserDto.companyId;

    if (!companyId) {
      throw new BadRequestException('Company ID is required');
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
      departmentId: department?.id || null,
      position,
      positionId: position?.id || null,
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
      userData.password = await bcrypt.hash(createUserDto.password!, 10);
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

    if (user.company.id !== currentUser.companyId) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN_NON_OWNERSHIP_ACCESS('this company'));
    }

    if (currentUser.role === UserRole.EMPLOYEE && currentUser.id !== id) {
      throw new ForbiddenException(
        ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(`${UserRole.HR} or ${UserRole.ADMIN}`),
      );
    }

    if (currentUser.role === UserRole.HR && user.role === UserRole.ADMIN) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(UserRole.ADMIN));
    }

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({
      where: { id },
      relations: ['company', 'department', 'position'],
    });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_WITH_ID_NOT_FOUND(id));
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
    const user = await this.findOne(id, currentUser);

    if (currentUser.role === UserRole.HR && user.role === UserRole.ADMIN) {
      throw new ForbiddenException('HR cannot update ADMIN users');
    }

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
          throw new BadRequestException('Cannot change your own role');
        }
        updateData.role = updateUserDto.role;
      }

      if (updateUserDto.status !== undefined && updateUserDto.status !== user.status) {
        if (user.id === currentUser.id && updateUserDto.status === UserStatus.BLOCKED) {
          throw new BadRequestException('Cannot block yourself');
        }
        updateData.status = updateUserDto.status;
      }
    }

    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.HR) {
      if (updateUserDto.departmentId !== undefined) {
        if (updateUserDto.departmentId === null) {
          updateData.department = null;
          updateData.departmentId = null;
        } else {
          const department = await this._findDepartmentById(
            updateUserDto.departmentId,
            currentUser.companyId,
          );
          updateData.department = department;
          updateData.departmentId = department.id;
        }
      }

      if (updateUserDto.positionId !== undefined) {
        if (updateUserDto.positionId === null) {
          updateData.position = null;
          updateData.positionId = null;
        } else {
          const position = await this._findPositionById(
            updateUserDto.positionId,
            currentUser.companyId,
          );
          updateData.position = position;
          updateData.positionId = position.id;
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
      throw new BadRequestException('Cannot delete yourself');
    }

    if (currentUser.role === UserRole.HR && user.role === UserRole.ADMIN) {
      throw new ForbiddenException('HR cannot delete ADMIN users');
    }

    await this._tokenService.revokeUserTokens(id);
    await this._usersRepository.softDelete(id);
  }

  async activateUser(token: string, password: string, _ip?: string): Promise<User> {
    const invite = await this._inviteRepository.findOne({
      where: { token },
      relations: ['company'],
    });

    if (!invite) {
      throw new BadRequestException('Invalid activation token');
    }

    let user = await this._usersRepository.findOne({
      where: { email: invite.email, company: { id: invite.company.id } },
    });

    if (!user) {
      user = this._usersRepository.create({
        email: invite.email,
        firstName: invite.email.split('@')[0],
        lastName: 'User',
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

    user.password = await bcrypt.hash(password, 10);
    user.status = UserStatus.ACTIVE;
    user.emailVerifiedAt = new Date();

    const savedUser = await this._usersRepository.save(user);

    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    await this._inviteRepository.save(invite);

    await this._tokenService.revokeToken(token);

    return savedUser;
  }

  async blockUser(id: string, currentUser: AuthorizedUser): Promise<User> {
    const user = await this.findOne(id, currentUser);

    if (user.id === currentUser.id) {
      throw new BadRequestException('Cannot block yourself');
    }

    if (user.role === UserRole.ADMIN && currentUser.role === UserRole.HR) {
      throw new ForbiddenException('HR cannot block ADMIN users');
    }

    user.status = UserStatus.BLOCKED;

    await this._tokenService.revokeUserTokens(id);
    return this._usersRepository.save(user);
  }

  async unblockUser(id: string, currentUser: AuthorizedUser): Promise<User> {
    const user = await this.findOne(id, currentUser);
    user.status = UserStatus.ACTIVE;
    user.resetFailedLoginAttempts();
    return this._usersRepository.save(user);
  }

  async getUsersByRole(companyId: string, role: UserRole): Promise<User[]> {
    return this._usersRepository.find({
      where: { company: { id: companyId }, role, status: UserStatus.ACTIVE, deletedAt: IsNull() },
      relations: ['department', 'position'],
    });
  }

  async getCompanyUsers(companyId: string): Promise<User[]> {
    return this._usersRepository.find({
      where: { company: { id: companyId }, deletedAt: IsNull() },
      relations: ['department', 'position'],
    });
  }

  async updateLastLogin(userId: string, ipAddress: string): Promise<void> {
    await this._usersRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.incrementFailedLoginAttempts();
    await this._usersRepository.save(user);
  }

  private async _ensureEmailUniqueInCompany(email: string, companyId: string): Promise<void> {
    const user = await this._usersRepository.findOne({
      where: { email, company: { id: companyId }, deletedAt: IsNull() },
    });

    if (user) {
      throw new ConflictException(ErrorMessages.USER_EMAIL_EXISTS(email));
    }
  }

  private async _findCompanyById(id: string): Promise<Company> {
    const company = await this._companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(ErrorMessages.COMPANY_WITH_ID_NOT_FOUND(id));
    }

    return company;
  }

  private async _findDepartmentById(id: string, companyId: string): Promise<Department> {
    const department = await this._departmentRepository.findOne({
      where: { id, company: { id: companyId } },
    });

    if (!department) {
      throw new NotFoundException(ErrorMessages.DEPARTMENT_NOT_FOUND(id));
    }

    return department;
  }

  private async _findPositionById(id: string, companyId: string): Promise<Position> {
    const position = await this._positionRepository.findOne({
      where: { id, company: { id: companyId } },
    });

    if (!position) {
      throw new NotFoundException(ErrorMessages.POSITION_NOT_FOUND(id));
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

    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${token.token}`;

    await this._emailService.sendInviteEmail(
      user.email,
      user.role, // role
      user.company.name, // companyName
      user.firstName, // invitedByName (who invite)
      activationLink, // inviteLink
    );
  }
}
