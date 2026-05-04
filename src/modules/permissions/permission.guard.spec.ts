import { Test, TestingModule } from '@nestjs/testing';
import { Reflector, ModuleRef } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionsService } from './permissions.service';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { User } from '@database/entities/user.entity';

interface MockRequest {
  user?: Partial<AuthorizedUser> | null;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  method?: string;
}

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let permissionsService: PermissionsService;
  let moduleRef: ModuleRef;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: PermissionsService, useValue: { assertCan: jest.fn() } },
        { provide: ModuleRef, useValue: { get: jest.fn() } },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    reflector = module.get<Reflector>(Reflector);
    permissionsService = module.get<PermissionsService>(PermissionsService);
    moduleRef = module.get<ModuleRef>(ModuleRef);
  });

  const mockExecutionContext = (overrides: MockRequest = {}): ExecutionContext => {
    const request = {
      user:
        overrides.user === null
          ? undefined
          : {
              id: 'u1',
              roles: [UserRole.EMPLOYEE],
              companyId: 'c1',
              permissions: [],
              ...overrides.user,
            },
      params: overrides.params || {},
      method: overrides.method || 'GET',
      body: overrides.body || {},
    };

    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should return false if user is not in request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(PermissionAction.USER_READ);
    const context = mockExecutionContext({ user: null });
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should handle missing repository gracefully', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(PermissionAction.USER_READ)
      .mockReturnValueOnce({ type: User, paramName: 'id' });

    jest.spyOn(moduleRef, 'get').mockImplementation(() => {
      throw new Error('Repo not found');
    });

    const context = mockExecutionContext({ params: { id: 'u1' } });
    await expect(guard.canActivate(context)).resolves.toBeDefined();
    expect(permissionsService.assertCan).toHaveBeenCalled();
  });

  it('should load composite resource when both metadata and body exist', async () => {
    const userFromDb = { id: 'u1', roles: [UserRole.EMPLOYEE], companyId: 'c1' };
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(PermissionAction.USER_UPDATE)
      .mockReturnValueOnce({ type: User, paramName: 'id' });
    jest
      .spyOn(moduleRef, 'get')
      .mockReturnValue({ findOne: jest.fn().mockResolvedValue(userFromDb) });

    const context = mockExecutionContext({
      params: { id: 'u1' },
      method: 'PATCH',
      body: { firstName: 'New' },
    });
    await guard.canActivate(context);

    expect(permissionsService.assertCan).toHaveBeenCalledWith(
      expect.anything(),
      PermissionAction.USER_UPDATE,
      expect.objectContaining({
        old: expect.objectContaining(userFromDb),
        new: { firstName: 'New' },
      }),
    );
  });
});
