import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@config/app.config', () => ({
  __esModule: true,
  default: {
    jwt: {
      secret: 'test-secret',
    },
    isProduction: false,
  },
}));

import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '@modules/core/users/users.service';
import { UserStatus } from '@common/enums/user-status.enum';
import { UserRole } from '@common/enums/user-role.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockPayload = {
    sub: 'user-id',
    roles: [UserRole.ADMIN],
    companyId: 'company-id',
    pv: 1,
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    status: UserStatus.ACTIVE,
    roles: [{ code: UserRole.ADMIN }],
    permissionsVersion: 1,
    firstName: 'Test',
    lastName: 'User',
    department: { id: 'dept-id' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            getPermissionsVersion: jest.fn().mockResolvedValue(1),
            findById: jest.fn().mockResolvedValue(mockUser),
            getUserPermissions: jest.fn().mockResolvedValue(['user.read', 'user.update']),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
  });

  it('should validate and return AuthorizedUser with fresh permissions', async () => {
    const result = await strategy.validate(mockPayload as any);

    expect(usersService.getPermissionsVersion).toHaveBeenCalledWith(mockPayload.sub);
    expect(usersService.getUserPermissions).toHaveBeenCalledWith(mockPayload.sub);

    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      roles: [UserRole.ADMIN],
      companyId: mockPayload.companyId,
      departmentId: 'dept-id',
      firstName: 'Test',
      lastName: 'User',
      permissions: ['user.read', 'user.update'],
      permissionsVersion: 1,
    });
  });

  it('should throw Unauthorized if version mismatch', async () => {
    usersService.getPermissionsVersion.mockResolvedValue(2);

    await expect(strategy.validate(mockPayload as any)).rejects.toThrow();
  });

  it('should throw Unauthorized if user is not active', async () => {
    usersService.findById.mockResolvedValue({ ...mockUser, status: UserStatus.BLOCKED });

    await expect(strategy.validate(mockPayload as any)).rejects.toThrow();
  });
});
