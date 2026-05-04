import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { PermissionsService, POLICY_RULES } from './permissions.service';
import { HrRestrictionRule } from './rules/hr-restriction.rule';
import { DepartmentScopeRule } from './rules/department-scope.rule';
import { CompanyBoundaryRule } from './rules/company-boundary.rule';
import { SelfAccessRule } from './rules/self-access.rule';
import { ResourceHelper } from './utils/resource-helper.service';

describe('PermissionsModule Integration (Exhaustive)', () => {
  let service: PermissionsService;
  let boundaryRule: CompanyBoundaryRule;
  let hrRule: HrRestrictionRule;

  const mockUser = (overrides: Partial<AuthorizedUser> = {}): AuthorizedUser => ({
    id: 'user-1',
    email: 'user@example.com',
    roles: [UserRole.EMPLOYEE],
    companyId: 'company-1',
    permissions: [],
    permissionsVersion: 1,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceHelper,
        PermissionsService,
        HrRestrictionRule,
        DepartmentScopeRule,
        CompanyBoundaryRule,
        SelfAccessRule,
        {
          provide: POLICY_RULES,
          useFactory: (hr, dept, boundary, self) => [hr, dept, boundary, self],
          inject: [HrRestrictionRule, DepartmentScopeRule, CompanyBoundaryRule, SelfAccessRule],
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    boundaryRule = module.get<CompanyBoundaryRule>(CompanyBoundaryRule);
    hrRule = module.get<HrRestrictionRule>(HrRestrictionRule);
  });

  describe('Core Pipeline Logic', () => {
    it('should bypass all checks for SUPER_ADMIN', async () => {
      const user = mockUser({ roles: [UserRole.SUPER_ADMIN] });
      const { denial } = await service.can(user, PermissionAction.COMPANY_DELETE);
      expect(denial).toBeNull();
    });

    it('should stop pipeline at first DENY and not execute subsequent rules', async () => {
      //! Important: CompanyBoundaryRule (priority 0) must be executed before HrRestrictionRule (priority 50)
      const user = mockUser({ permissions: [PermissionAction.USER_READ] });
      const resource = { id: 'other', companyId: 'other-company', roles: [UserRole.ADMIN] };

      const boundarySpy = jest.spyOn(boundaryRule, 'check');
      const hrSpy = jest.spyOn(hrRule, 'check');

      const { denial } = await service.can(user, PermissionAction.USER_READ, resource);

      expect(denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_NON_OWNERSHIP);
      expect(boundarySpy).toHaveBeenCalled();
      expect(hrSpy).not.toHaveBeenCalled();
    });
  });

  describe('HrRestrictionRule', () => {
    it('HR should NOT be able to touch ADMIN or other HR', async () => {
      const hrUser = mockUser({ roles: [UserRole.HR], permissions: [PermissionAction.USER_READ] });
      const toAdmin = await service.can(hrUser, PermissionAction.USER_READ, {
        roles: [UserRole.ADMIN],
        companyId: 'company-1',
      });
      expect(toAdmin.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);
    });
  });

  describe('SelfAccessRule', () => {
    it('should allow updating safe fields and deny sensitive on own profile', async () => {
      const user = mockUser({ id: 'me' });

      const ok = await service.can(user, PermissionAction.USER_UPDATE, {
        id: 'me',
        companyId: 'company-1',
        roles: [UserRole.EMPLOYEE],
        new: { avatar: 'new-avatar.png' },
      });
      expect(ok.denial).toBeNull();

      const failMerged = await service.can(user, PermissionAction.USER_UPDATE, {
        id: 'me',
        companyId: 'company-1',
        roles: [UserRole.EMPLOYEE],
        avatar: 'new-avatar.png',
      });
      expect(failMerged.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);

      const failSensitive = await service.can(user, PermissionAction.USER_UPDATE, {
        id: 'me',
        companyId: 'company-1',
        new: { roles: [UserRole.ADMIN] },
      });
      expect(failSensitive.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);
    });
  });

  describe('Role-based Profile Updates', () => {
    it('HR should be able to update their own profile including sensitive fields if they have RBAC permission', async () => {
      const hrUser = mockUser({
        id: 'hr-1',
        roles: [UserRole.HR],
        permissions: [PermissionAction.USER_UPDATE],
      });

      const result = await service.can(hrUser, PermissionAction.USER_UPDATE, {
        id: 'hr-1',
        companyId: 'company-1',
        new: { roles: [UserRole.ADMIN] },
      });

      expect(result.denial).toBeNull();
    });

    it('Employee WITHOUT RBAC permission should be restricted to basic fields on self', async () => {
      const employee = mockUser({
        id: 'emp-1',
        roles: [UserRole.EMPLOYEE],
        permissions: [],
      });

      const ok = await service.can(employee, PermissionAction.USER_UPDATE, {
        id: 'emp-1',
        companyId: 'company-1',
        new: { firstName: 'New Name' },
      });
      expect(ok.denial).toBeNull();

      const fail = await service.can(employee, PermissionAction.USER_UPDATE, {
        id: 'emp-1',
        companyId: 'company-1',
        new: { roles: [UserRole.ADMIN] },
      });
      expect(fail.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);
    });

    it('Manager should be able to update team members basic info but NOT sensitive fields', async () => {
      const manager = mockUser({
        id: 'mgr-1',
        roles: [UserRole.MANAGER],
        departmentId: 'dept-1',
        permissions: [PermissionAction.USER_UPDATE],
      });

      const targetEmployee = {
        id: 'emp-1',
        companyId: 'company-1',
        departmentId: 'dept-1',
        roles: [UserRole.EMPLOYEE],
      };

      const ok = await service.can(manager, PermissionAction.USER_UPDATE, {
        ...targetEmployee,
        new: { firstName: 'Updated' },
      });
      expect(ok.denial).toBeNull();

      const fail = await service.can(manager, PermissionAction.USER_UPDATE, {
        ...targetEmployee,
        new: { roles: [UserRole.ADMIN] },
      });
      expect(fail.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);
      expect(fail.trace.some((t) => t.rule === 'HrRestrictionRule' && t.effect === 'DENY')).toBe(
        true,
      );
    });

    it('User with BOTH HR and MANAGER roles should bypass department scope restriction', async () => {
      const hrManager = mockUser({
        id: 'hr-mgr-1',
        roles: [UserRole.HR, UserRole.MANAGER],
        departmentId: 'dept-1',
        permissions: [PermissionAction.USER_READ],
      });

      const targetInOtherDept = {
        id: 'emp-2',
        companyId: 'company-1',
        departmentId: 'other-dept',
        roles: [UserRole.EMPLOYEE],
      };

      const result = await service.can(hrManager, PermissionAction.USER_READ, targetInOtherDept);

      expect(result.denial).toBeNull();
      expect(
        result.trace.some((t) => t.rule === 'DepartmentScopeRule' && t.effect === 'SKIP'),
      ).toBe(true);
    });
  });

  describe('Role Management', () => {
    it('HR should be able to promote Employee to Manager', async () => {
      const hrUser = mockUser({
        roles: [UserRole.HR],
        permissions: [PermissionAction.USER_MANAGE_ROLES],
      });

      const result = await service.can(hrUser, PermissionAction.USER_MANAGE_ROLES, {
        id: 'emp-1',
        roles: [UserRole.EMPLOYEE],
        new: { roles: [UserRole.MANAGER] },
      });

      expect(result.denial).toBeNull();
    });

    it('HR should be able to promote HR to Manager', async () => {
      const hrUser = mockUser({
        roles: [UserRole.HR],
        permissions: [PermissionAction.USER_MANAGE_ROLES],
      });

      const result = await service.can(hrUser, PermissionAction.USER_MANAGE_ROLES, {
        id: 'hr-target',
        roles: [UserRole.HR],
        new: { roles: [UserRole.MANAGER] },
      });

      expect(result.denial).toBeNull();
    });

    it('HR should be able to promote Employee to HR', async () => {
      const hrUser = mockUser({
        roles: [UserRole.HR],
        permissions: [PermissionAction.USER_MANAGE_ROLES],
      });

      const result = await service.can(hrUser, PermissionAction.USER_MANAGE_ROLES, {
        id: 'emp-1',
        roles: [UserRole.EMPLOYEE],
        new: { roles: [UserRole.HR] },
      });

      expect(result.denial).toBeNull();
    });

    it('HR should NOT be able to promote Employee to Admin', async () => {
      const hrUser = mockUser({
        roles: [UserRole.HR],
        permissions: [PermissionAction.USER_MANAGE_ROLES],
      });

      const result = await service.can(hrUser, PermissionAction.USER_MANAGE_ROLES, {
        id: 'emp-1',
        roles: [UserRole.EMPLOYEE],
        new: { roles: [UserRole.ADMIN] },
      });

      expect(result.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);
    });
  });

  describe('ResourceHelper', () => {
    let helper: ResourceHelper;
    beforeEach(() => {
      helper = new ResourceHelper();
    });

    it('should extract companyId with priority new > old > flat', () => {
      expect(
        helper.getResourceCompanyId({
          companyId: 'flat',
          old: { companyId: 'old' },
          new: { companyId: 'new' },
        }),
      ).toBe('new');

      expect(
        helper.getResourceCompanyId({
          companyId: 'flat',
          old: { companyId: 'old' },
        }),
      ).toBe('old');
    });

    it('should extract departmentId with priority new > old > flat', () => {
      expect(
        helper.getResourceDepartmentId({
          departmentId: 'flat',
          new: { departmentId: 'new' },
        }),
      ).toBe('new');
    });

    it('should extract roles with priority new > old > flat', () => {
      expect(
        helper.getResourceRoles({
          roles: [UserRole.EMPLOYEE],
          new: { roles: [UserRole.HR] },
        }),
      ).toEqual([UserRole.HR]);
    });
  });
});
