import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@config/app.config', () => ({
  __esModule: true,
  default: {
    frontend: { url: 'http://localhost:3000' },
    isProduction: false,
  },
}));

import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@database/entities/user.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { Invite } from '@database/entities/invite.entity';
import { Role } from '@database/entities/role.entity';
import { PaginationService } from '@modules/pagination/pagination.service';
import { UserFilterBuilder } from './user-filter.builder';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { UsersService } from './users.service';

describe('UsersService (Permissions Cache)', () => {
  let service: UsersService;
  let repo: { findOne: jest.Mock; increment: jest.Mock };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      increment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
        { provide: getRepositoryToken(Company), useValue: {} },
        { provide: getRepositoryToken(Department), useValue: {} },
        { provide: getRepositoryToken(Position), useValue: {} },
        { provide: getRepositoryToken(Invite), useValue: {} },
        { provide: getRepositoryToken(Role), useValue: {} },
        { provide: PaginationService, useValue: {} },
        { provide: UserFilterBuilder, useValue: {} },
        { provide: EmailService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: PermissionsService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('Permissions Version Cache', () => {
    const userId = 'user-1';

    it('should load version from DB and cache it', async () => {
      repo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 5 });

      const v1 = await service.getPermissionsVersion(userId);
      expect(v1).toBe(5);
      expect(repo.findOne).toHaveBeenCalledTimes(1);

      // Second call within 15s should use cache
      const v2 = await service.getPermissionsVersion(userId);
      expect(v2).toBe(5);
      expect(repo.findOne).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should ignore cache if forceRefresh is true', async () => {
      repo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 5 });
      await service.getPermissionsVersion(userId);

      repo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 6 });
      const v2 = await service.getPermissionsVersion(userId, true);
      expect(v2).toBe(6);
      expect(repo.findOne).toHaveBeenCalledTimes(2);
    });

    it('should increment version and clear cache', async () => {
      repo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 5 });
      await service.getPermissionsVersion(userId);
      expect(repo.findOne).toHaveBeenCalledTimes(1);

      await service.incrementPermissionsVersion(userId);
      expect(repo.increment).toHaveBeenCalledWith({ id: userId }, 'permissionsVersion', 1);

      // Cache should be cleared, next call hits DB
      repo.findOne.mockResolvedValue({ id: userId, permissionsVersion: 6 });
      const v2 = await service.getPermissionsVersion(userId);
      expect(v2).toBe(6);
      expect(repo.findOne).toHaveBeenCalledTimes(2);
    });
  });
});
