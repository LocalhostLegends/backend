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
    role: UserRole.EMPLOYEE,
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
      const user = mockUser({ role: UserRole.SUPER_ADMIN });
      const { denial } = await service.can(user, PermissionAction.COMPANY_DELETE);
      expect(denial).toBeNull();
    });

    it('should stop pipeline at first DENY and not execute subsequent rules', async () => {
      //! Important: CompanyBoundaryRule (priority 0) must be executed before HrRestrictionRule (priority 50)
      const user = mockUser({ permissions: [PermissionAction.USER_READ] });
      const resource = { id: 'other', companyId: 'other-company', role: UserRole.ADMIN };

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
      const hrUser = mockUser({ role: UserRole.HR, permissions: [PermissionAction.USER_READ] });
      const toAdmin = await service.can(hrUser, PermissionAction.USER_READ, {
        role: UserRole.ADMIN,
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
        new: { firstName: 'New' },
      });
      expect(ok.denial).toBeNull();

      const fail = await service.can(user, PermissionAction.USER_UPDATE, {
        id: 'me',
        companyId: 'company-1',
        new: { role: UserRole.ADMIN },
      });
      expect(fail.denial?.code).toBe(ExceptionCode.AUTH_FORBIDDEN_RESOURCE);
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

    it('should extract role with priority new > old > flat', () => {
      expect(helper.getResourceRole({ role: UserRole.EMPLOYEE, new: { role: UserRole.HR } })).toBe(
        UserRole.HR,
      );
    });
  });
});
