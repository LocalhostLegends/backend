import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { Invite } from '@database/entities/invite.entity';
import { Company } from '@database/entities/company.entity';
import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { UserStatus } from '@database/enums/user-status.enum';
import { TokenType } from '@database/enums/token-type.enum';
import { InviteStatus } from '@database/enums/invite-status.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { ErrorMessages } from '@common/exceptions/error-messages';
import type { AuthorizedUser } from '@common/types/authorized-user.type';

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
  ) {}

  async createInvite(dto: CreateInviteDto, currentUser: AuthorizedUser): Promise<Invite> {
    if (currentUser.role === UserRole.HR && dto.role === UserRole.ADMIN) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN_INVITE_ADMIN);
    }

    const existingUser = await this._usersService.findByEmail(dto.email, currentUser.companyId);

    if (existingUser && existingUser.status !== UserStatus.INVITED) {
      throw new BadRequestException(
        ErrorMessages.USER_EMAIL_EXISTS_AND_INVITED(existingUser.email),
      );
    }

    const existingInvite = await this._inviteRepository.findOne({
      where: {
        email: dto.email,
        company: { id: currentUser.companyId },
        status: InviteStatus.PENDING,
      },
    });

    if (existingInvite) {
      throw new BadRequestException(ErrorMessages.ACTIVE_INVITE_EXISTS(dto.email));
    }

    const company = await this._companyRepository.findOne({
      where: { id: currentUser.companyId },
    });

    if (!company) {
      throw new NotFoundException(ErrorMessages.COMPANY_NOT_FOUND);
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

    const inviteLink = `${process.env.FRONTEND_URL}/auth/accept-invite?token=${token}`;
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
      throw new NotFoundException(ErrorMessages.INVITE_NOT_FOUND);
    }

    return loadedInvite;
  }

  async validateInvite(token: string): Promise<Invite> {
    const invite = await this._inviteRepository.findOne({
      where: { token },
      relations: ['company', 'invitedBy'],
    });

    if (!invite) {
      throw new NotFoundException(ErrorMessages.INVALID_INVITE_TOKEN);
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(ErrorMessages.INVITE_STATUS(invite.status));
    }

    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this._inviteRepository.save(invite);
      throw new BadRequestException(ErrorMessages.INVITE_HAS_EXPIRED);
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

    // ✅ доступ к id через invite.company.id
    const existingUser = await this._usersService.findByEmail(invite.email, invite.company.id);

    if (existingUser && existingUser.status === UserStatus.ACTIVE) {
      throw new BadRequestException(ErrorMessages.USER_EMAIL_EXISTS_AND_ACTIVE(existingUser.email));
    }

    if (existingUser && existingUser.status === UserStatus.INVITED) {
      const activatedUser = await this._usersService.activateUser(token, password, ip);

      invite.status = InviteStatus.ACCEPTED;
      invite.acceptedAt = new Date();
      await this._inviteRepository.save(invite);

      return activatedUser;
    }

    // ✅ доступ к id через invite.company.id и invite.invitedBy.id
    await this._usersService.createInvitedUser(
      firstName || invite.email.split('@')[0],
      lastName || 'User',
      invite.email,
      invite.role as UserRole,
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
    // ✅ используем company: { id: ... }
    const invite = await this._inviteRepository.findOne({
      where: { id: inviteId },
      relations: ['company', 'invitedBy'],
    });

    if (!invite) {
      throw new NotFoundException(ErrorMessages.INVITE_NOT_FOUND);
    }

    if (invite.company.id !== currentUser.companyId) {
      throw new ForbiddenException(
        ErrorMessages.INVITE_NOT_IN_COMPANY(invite.id, currentUser.companyId),
      );
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(ErrorMessages.FORBIDDEN_RESEND_INVITE(invite.status));
    }

    invite.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    invite.sentCount += 1;
    await this._inviteRepository.save(invite);

    const inviteLink = `${process.env.FRONTEND_URL}/auth/accept-invite?token=${invite.token}`;
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
    // ✅ используем company: { id: ... }
    const invite = await this._inviteRepository.findOne({
      where: { id: inviteId },
      relations: ['company'],
    });

    if (!invite) {
      throw new NotFoundException(ErrorMessages.INVITE_NOT_FOUND);
    }

    if (invite.company.id !== currentUser.companyId) {
      throw new ForbiddenException(
        ErrorMessages.INVITE_NOT_IN_COMPANY(invite.id, currentUser.companyId),
      );
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(ErrorMessages.FORBIDDEN_CANCEL_INVITE(invite.status));
    }

    invite.status = InviteStatus.CANCELLED;
    await this._inviteRepository.save(invite);
  }

  async getCompanyInvites(companyId: string): Promise<Invite[]> {
    // ✅ используем company: { id: ... }
    return this._inviteRepository.find({
      where: { company: { id: companyId } },
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingInvites(companyId: string): Promise<Invite[]> {
    // ✅ используем company: { id: ... }
    return this._inviteRepository.find({
      where: {
        company: { id: companyId },
        status: InviteStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
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
      throw new NotFoundException(ErrorMessages.DEPARTMENT_NOT_FOUND(departmentId));
    }

    if (department.company.id !== companyId) {
      throw new ForbiddenException(
        ErrorMessages.DEPARTMENT_NOT_IN_COMPANY(departmentId, companyId),
      );
    }
  }

  private async _ensurePositionInCompany(positionId: string, companyId: string) {
    const position = await this._positionRepository.findOne({
      where: { id: positionId },
      relations: ['company'],
    });

    if (!position) {
      throw new NotFoundException(ErrorMessages.POSITION_NOT_FOUND(positionId));
    }

    if (position.company.id !== companyId) {
      throw new ForbiddenException(ErrorMessages.POSITION_NOT_IN_COMPANY(positionId, companyId));
    }
  }
}
