import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, FindOptionsWhere } from 'typeorm';
import { randomUUID } from 'crypto';

import config from '@config/app.config';
import { Invite } from '@database/entities/invite.entity';
import { Company } from '@database/entities/company.entity';
import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { UserStatus } from '@common/enums/user-status.enum';
import { TokenType } from '@common/enums/token-type.enum';
import { InviteStatus } from '@common/enums/invite-status.enum';
import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@/modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreateInviteDto } from './dto/create-invite.dto';

import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite)
    private readonly _inviteRepository: Repository<Invite>,
    @InjectRepository(Company)
    private readonly _companyRepository: Repository<Company>,
    @InjectRepository(Department)
    private readonly _departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private readonly _positionRepository: Repository<Position>,
    private readonly _emailService: EmailService,
    private readonly _usersService: UsersService,
    private readonly _tokenService: TokenService,
    private readonly _permissions: PermissionsService,
  ) {}

  async createInvite(dto: CreateInviteDto, currentUser: AuthorizedUser): Promise<Invite> {
    await this._permissions.assertCan(currentUser, PermissionAction.INVITE_CREATE);

    if (currentUser.role === UserRole.HR && dto.role === UserRole.ADMIN) {
      throw ExceptionFactory.inviteForbiddenAdmin();
    }

    const existingUser = await this._usersService.findByEmail(dto.email, currentUser.companyId);

    if (existingUser && existingUser.status !== UserStatus.INVITED) {
      throw ExceptionFactory.userEmailExistsAndInvited(existingUser.email);
    }

    const existingInvite = await this._inviteRepository.findOne({
      where: {
        email: dto.email,
        company: { id: currentUser.companyId },
        status: InviteStatus.PENDING,
      },
    });

    if (existingInvite) {
      throw ExceptionFactory.inviteActiveExists(dto.email);
    }

    const company = await this._companyRepository.findOne({
      where: { id: currentUser.companyId },
    });

    if (!company) {
      throw ExceptionFactory.companyNotFound();
    }

    if (dto.departmentId) {
      await this._ensureDepartmentInCompany(dto.departmentId, currentUser.companyId);
    }

    if (dto.positionId) {
      await this._ensurePositionInCompany(dto.positionId, currentUser.companyId);
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const result = await this._inviteRepository
      .createQueryBuilder()
      .insert()
      .into(Invite)
      .values({
        email: dto.email,
        token: token,
        role: dto.role,
        company: { id: currentUser.companyId },
        invitedBy: { id: currentUser.id },
        departmentId: dto.departmentId || null,
        positionId: dto.positionId || null,
        expiresAt: expiresAt,
        status: InviteStatus.PENDING,
        sentCount: 1,
      })
      .returning('*')
      .execute();

    const savedInvite = result.generatedMaps[0] as Invite;

    await this._tokenService.createToken(null, TokenType.ACTIVATION, 48, token);

    const inviteLink = `${config.frontend.url}/invite-accept?token=${token}`;
    await this._emailService.sendInviteEmail(
      dto.email,
      dto.role,
      company.name,
      currentUser.firstName || currentUser.email,
      inviteLink,
    );

    const loadedInvite = await this._inviteRepository.findOne({
      where: { id: savedInvite.id },
      relations: ['company', 'invitedBy'],
    });

    if (!loadedInvite) {
      throw ExceptionFactory.inviteNotFound();
    }

    return loadedInvite;
  }

  async validateInvite(token: string): Promise<Invite> {
    const invite = await this._inviteRepository.findOne({
      where: { token },
      relations: ['company', 'invitedBy'],
    });

    if (!invite) {
      throw ExceptionFactory.inviteInvalidToken();
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw ExceptionFactory.inviteAlreadyStatus(invite.status);
    }

    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this._inviteRepository.save(invite);
      throw ExceptionFactory.inviteExpired();
    }

    return invite;
  }

  async acceptInvite(
    token: string,
    password: string,
    firstName?: string,
    lastName?: string,
    ip?: string,
  ): Promise<User> {
    const invite = await this.validateInvite(token);

    const existingUser = await this._usersService.findByEmail(invite.email, invite.company.id);

    if (existingUser && existingUser.status === UserStatus.ACTIVE) {
      throw ExceptionFactory.userEmailExistsAndActive(existingUser.email);
    }

    if (existingUser && existingUser.status === UserStatus.INVITED) {
      const activatedUser = await this._usersService.activateUser(token, password, ip);

      invite.status = InviteStatus.ACCEPTED;
      invite.acceptedAt = new Date();
      await this._inviteRepository.save(invite);

      return activatedUser;
    }

    await this._usersService.createInvitedUser(
      firstName || invite.email.split('@')[0],
      lastName || 'User',
      invite.email,
      invite.role,
      invite.company.id,
      invite.invitedBy.id,
    );

    const activatedUser = await this._usersService.activateUser(token, password, ip);

    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    await this._inviteRepository.save(invite);

    return activatedUser;
  }

  async resendInvite(inviteId: string, currentUser: AuthorizedUser): Promise<Invite> {
    const invite = await this._inviteRepository.findOne({
      where: { id: inviteId },
      relations: ['company', 'invitedBy'],
    });

    if (!invite) {
      throw ExceptionFactory.inviteNotFound();
    }

    await this._permissions.assertCan(currentUser, PermissionAction.INVITE_RESEND, invite);

    if (invite.status !== InviteStatus.PENDING) {
      throw ExceptionFactory.inviteCannotResend(invite.status);
    }

    invite.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    invite.sentCount += 1;
    await this._inviteRepository.save(invite);

    const inviteLink = `${config.frontend.url}/auth/accept-invite?token=${invite.token}`;
    await this._emailService.sendInviteEmail(
      invite.email,
      invite.role,
      invite.company.name,
      invite.invitedBy.firstName || invite.invitedBy.email,
      inviteLink,
    );

    return invite;
  }

  async cancelInvite(inviteId: string, currentUser: AuthorizedUser): Promise<void> {
    const invite = await this._inviteRepository.findOne({
      where: { id: inviteId },
      relations: ['company'],
    });

    if (!invite) {
      throw ExceptionFactory.inviteNotFound();
    }

    await this._permissions.assertCan(currentUser, PermissionAction.INVITE_CANCEL, invite);

    if (invite.status !== InviteStatus.PENDING) {
      throw ExceptionFactory.inviteCannotCancel(invite.status);
    }

    invite.status = InviteStatus.CANCELLED;
    await this._inviteRepository.save(invite);
  }

  async getCompanyInvites(currentUser: AuthorizedUser): Promise<Invite[]> {
    await this._permissions.assertCan(currentUser, PermissionAction.INVITE_READ);

    const where: FindOptionsWhere<Invite> = { company: { id: currentUser.companyId } };
    if (currentUser.role === UserRole.MANAGER && currentUser.departmentId) {
      where.departmentId = currentUser.departmentId;
    }

    return this._inviteRepository.find({
      where,
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingInvites(currentUser: AuthorizedUser): Promise<Invite[]> {
    await this._permissions.assertCan(currentUser, PermissionAction.INVITE_READ);

    const where: FindOptionsWhere<Invite> = {
      company: { id: currentUser.companyId },
      status: InviteStatus.PENDING,
      expiresAt: MoreThan(new Date()),
    };

    if (currentUser.role === UserRole.MANAGER && currentUser.departmentId) {
      where.departmentId = currentUser.departmentId;
    }

    return this._inviteRepository.find({
      where,
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async cleanupExpiredInvites(): Promise<number> {
    const result = await this._inviteRepository
      .createQueryBuilder()
      .update(Invite)
      .set({ status: InviteStatus.EXPIRED })
      .where('status = :status', { status: InviteStatus.PENDING })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  private async _ensureDepartmentInCompany(departmentId: string, companyId: string) {
    const department = await this._departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['company'],
    });

    if (!department) {
      throw ExceptionFactory.departmentNotFound(departmentId);
    }

    if (department.company.id !== companyId) {
      throw ExceptionFactory.departmentNotInCompany(departmentId, companyId);
    }
  }

  private async _ensurePositionInCompany(positionId: string, companyId: string) {
    const position = await this._positionRepository.findOne({
      where: { id: positionId },
      relations: ['company'],
    });

    if (!position) {
      throw ExceptionFactory.positionNotFound(positionId);
    }

    if (position.company.id !== companyId) {
      throw ExceptionFactory.positionNotInCompany(positionId, companyId);
    }
  }
}
