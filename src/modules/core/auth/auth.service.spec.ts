import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';

jest.mock('@config/app.config', () => ({
  __esModule: true,
  default: {
    jwt: {
      secret: 'test-secret',
      expiresIn: '1h',
      refreshSecret: 'refresh-secret',
      refreshExpiresIn: '7d',
    },
    isProduction: false,
  },
}));

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '@modules/organization/companies/companies.service';
import { TokenService } from '../token/token.service';
import { EmailService } from '../email/email.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: jest.Mocked<UsersService>;
  let eventBus: jest.Mocked<EventEmitter2>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    status: UserStatus.ACTIVE,
    company: { id: 'company-id', name: 'Test Co' },
    roles: [{ code: UserRole.ADMIN }],
    permissionsVersion: 1,
    security: { password: 'hashed_password' },
    isActive: () => true,
    isLocked: () => false,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            getUserPermissions: jest.fn().mockResolvedValue(['user.read']),
            updateLastLogin: jest.fn(),
            incrementFailedLoginAttempts: jest.fn(),
          },
        },
        { provide: CompaniesService, useValue: {} },
        { provide: TokenService, useValue: {} },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
        { provide: EmailService, useValue: {} },
        {
          provide: AuditLogService,
          useValue: {
            createAuthLog: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get(UsersService);
    eventBus = module.get(EventEmitter2);
  });

  describe('login', () => {
    it('should return accessToken and user info without email/permissions in token payload', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.permissions).toContain('user.read');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          roles: [UserRole.ADMIN],
          companyId: 'company-id',
          pv: 1,
        }),
        expect.any(Object),
      );

      expect(eventBus.emit).toHaveBeenCalledWith(
        'auth.login.success',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
        }),
      );

      const signCall = (jwtService.sign as jest.Mock).mock.calls.find(
        (call) => !call[1].secret.includes('refresh'),
      );

      if (signCall) {
        expect(signCall[0]).not.toHaveProperty('email');
        expect(signCall[0]).not.toHaveProperty('permissions');
      }
    });

    it('should generate long-lived refresh token when rememberMe is true', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const context = {
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      } as any;

      const result = await service.login(
        {
          email: 'test@example.com',
          password: 'password',
          rememberMe: true,
        },
        context,
      );

      expect(result.rememberMe).toBe(true);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          rememberMe: true,
          ip: '127.0.0.1',
          ua: 'test-agent',
        }),
        expect.objectContaining({
          expiresIn: '30d',
        }),
      );

      expect(eventBus.emit).toHaveBeenCalledWith(
        'auth.login.success',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          ip: '127.0.0.1',
          userAgent: 'test-agent',
        }),
      );
    });
  });
});
