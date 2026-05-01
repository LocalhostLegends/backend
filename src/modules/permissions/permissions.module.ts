import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '@database/entities/permission.entity';
import { Role } from '@database/entities/role.entity';
import { User } from '@database/entities/user.entity';
import { PermissionsService, POLICY_RULES } from './permissions.service';
import { HrRestrictionRule } from './rules/hr-restriction.rule';
import { DepartmentScopeRule } from './rules/department-scope.rule';
import { CompanyBoundaryRule } from './rules/company-boundary.rule';
import { SelfAccessRule } from './rules/self-access.rule';
import { ResourceHelper } from './utils/resource-helper.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, User])],
  providers: [
    ResourceHelper,
    PermissionsService,
    HrRestrictionRule,
    DepartmentScopeRule,
    CompanyBoundaryRule,
    SelfAccessRule,
    {
      provide: POLICY_RULES,
      useFactory: (
        hr: HrRestrictionRule,
        dept: DepartmentScopeRule,
        boundary: CompanyBoundaryRule,
        self: SelfAccessRule,
      ) => [hr, dept, boundary, self],
      inject: [HrRestrictionRule, DepartmentScopeRule, CompanyBoundaryRule, SelfAccessRule],
    },
  ],
  exports: [PermissionsService, ResourceHelper],
})
export class PermissionsModule {}
