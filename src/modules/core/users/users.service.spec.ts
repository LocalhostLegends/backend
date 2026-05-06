import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

jest.mock('@config/app.config', () => ({
  __esModule: true,
  default: {
    frontend: { url: 'http://localhost:3000' },
    isProduction: false,
  },
}));

import { User } from '@database/entities/user.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { Invite } from '@database/entities/invite.entity';
import { Role } from '@database/entities/role.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PaginationService } from '@modules/pagination/pagination.service';
import { UserFilterBuilder } from './user-filter.builder';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { UsersService } from './users.service';
import { AuthorizedUser } from './users.types';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: jest.Mocked<Repository<User>>;
  let tokenService: jest.Mocked<TokenService>;

  const mockUser = {
    id: 'user-id',
    email: 'old@example.com',
    company: { id: 'company-id' } as Company,
    roles: [{ code: UserRole.EMPLOYEE }] as Role[],
  } as User;

  const adminUser: AuthorizedUser = {
    id: 'admin-id',
    email: 'admin@example.com',
    roles: [UserRole.ADMIN],
    companyId: 'company-id',
    permissions: [],
    permissionsVersion: 1,
  };

  const hrUser: AuthorizedUser = {
    id: 'hr-id',
    email: 'hr@example.com',
    roles: [UserRole.HR],
    companyId: 'company-id',
    permissions: [],
    permissionsVersion: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            increment: jest.fn(),
          },
        },
        { provide: getRepositoryToken(Company), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Department), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Position), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Invite), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Role), useValue: { find: jest.fn() } },
        { provide: PaginationService, useValue: {} },
        { provide: UserFilterBuilder, useValue: {} },
        { provide: EmailService, useValue: {} },
        {
          provide: TokenService,
          useValue: {
            revokeUserTokens: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            assertCan: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
    tokenService = module.get(TokenService);
  });

  describe('Permissions Version Cache', () => {
    const userId = 'user-1';

    it('should load version from DB and cache it', async () => {
      usersRepo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 5 } as User);

      const v1 = await service.getPermissionsVersion(userId);
      expect(v1).toBe(5);
      expect(usersRepo.findOne).toHaveBeenCalledTimes(1);

      const v2 = await service.getPermissionsVersion(userId);
      expect(v2).toBe(5);
      expect(usersRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should increment version and clear cache', async () => {
      usersRepo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 5 } as User);
      await service.getPermissionsVersion(userId);

      await service.incrementPermissionsVersion(userId);
      expect(usersRepo.increment).toHaveBeenCalledWith({ id: userId }, 'permissionsVersion', 1);

      usersRepo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 6 } as User);
      const v2 = await service.getPermissionsVersion(userId);
      expect(v2).toBe(6);
      expect(usersRepo.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('update (Email Restriction)', () => {
    it('should allow ADMIN to change user email and revoke tokens', async () => {
      const updateDto: UpdateUserDto = { email: 'new@example.com' };

      usersRepo.findOne.mockResolvedValueOnce(mockUser);
      usersRepo.findOne.mockResolvedValueOnce(null);
      usersRepo.merge.mockReturnValue({ ...mockUser, email: updateDto.email } as User);
      usersRepo.save.mockResolvedValue({ ...mockUser, email: updateDto.email } as User);

      await service.update(mockUser.id, updateDto, adminUser);

      expect(tokenService.revokeUserTokens).toHaveBeenCalledWith(mockUser.id);
      expect(usersRepo.save).toHaveBeenCalled();
    });

    it('should throw Forbidden if HR tries to change email', async () => {
      const updateDto: UpdateUserDto = { email: 'new@example.com' };
      usersRepo.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.update(mockUser.id, updateDto, hrUser)).rejects.toThrow(
        ExceptionFactory.forbidden(),
      );

      expect(tokenService.revokeUserTokens).not.toHaveBeenCalled();
    });

    it('should allow HR to change other fields without revoking tokens', async () => {
      const updateDto: UpdateUserDto = { firstName: 'NewName' };
      usersRepo.findOne.mockResolvedValueOnce(mockUser);
      usersRepo.merge.mockReturnValue({ ...mockUser, firstName: updateDto.firstName } as User);
      usersRepo.save.mockResolvedValue({ ...mockUser, firstName: updateDto.firstName } as User);

      await service.update(mockUser.id, updateDto, hrUser);

      expect(tokenService.revokeUserTokens).not.toHaveBeenCalled();
      expect(usersRepo.save).toHaveBeenCalled();
    });
  });
});
