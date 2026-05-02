import { Injectable, HttpStatus, Inject, Logger } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { AppException } from '@common/exceptions/app.exception';
import { ExceptionParams } from '@common/exceptions/exception.types';

import { PolicyRule } from './interfaces/policy-rule.interface';

export const POLICY_RULES = 'POLICY_RULES';

export interface WrappedResource {
  id?: string;
  old?: WrappedResource;
  new?: Record<string, unknown>;
  role?: UserRole;
  companyId?: string | null;
  departmentId?: string | null;
  company?: { id: string } | null;
  department?: { id: string } | null;
}

export type PermissionResource = WrappedResource;

export interface DenialReason<K extends ExceptionCode = ExceptionCode> {
  code: K;
  params?: ExceptionParams[K];
}

export type PolicyEffect = 'ALLOW' | 'DENY' | 'SKIP';

export interface PolicyResult {
  effect: PolicyEffect;
  reason?: DenialReason;
}

export interface PermissionTrace {
  rule: string;
  effect: PolicyEffect;
  reason?: DenialReason;
}

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @Inject(POLICY_RULES)
    private readonly rules: PolicyRule[],
  ) {}

  async can(
    user: AuthorizedUser,
    action: PermissionAction,
    resource?: PermissionResource | null,
  ): Promise<{ denial: DenialReason | null; trace: PermissionTrace[] }> {
    const trace: PermissionTrace[] = [];

    if (user.role === UserRole.SUPER_ADMIN) {
      return { denial: null, trace: [{ rule: 'SuperAdminBypass', effect: 'ALLOW' }] };
    }

    let isAllowed = false;

    const rbacEffect: PolicyEffect = user.permissions.includes(action) ? 'ALLOW' : 'SKIP';
    trace.push({ rule: 'RBAC', effect: rbacEffect });
    if (rbacEffect === 'ALLOW') isAllowed = true;

    const applicableRules = this.rules
      .filter((rule) => rule.supports(action))
      .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

    for (const rule of applicableRules) {
      const result = await rule.check(user, action, resource);
      trace.push({ rule: rule.constructor.name, effect: result.effect, reason: result.reason });

      if (result.effect === 'DENY') {
        const denial = result.reason || { code: ExceptionCode.AUTH_FORBIDDEN };
        this._logDecision(user, action, 'DENY', trace);
        return { denial, trace };
      }

      if (result.effect === 'ALLOW') {
        isAllowed = true;
      }
    }

    if (isAllowed) {
      return { denial: null, trace };
    }

    const finalDenial: DenialReason<ExceptionCode.AUTH_FORBIDDEN_RESOURCE> = {
      code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
      params: ['access policy', false],
    };

    this._logDecision(user, action, 'DENY', trace);
    return { denial: finalDenial, trace };
  }

  async assertCan(
    user: AuthorizedUser,
    action: PermissionAction,
    resource?: PermissionResource | null,
  ): Promise<void> {
    const { denial } = await this.can(user, action, resource);
    if (denial !== null) {
      throw new AppException(denial.code, HttpStatus.FORBIDDEN, denial.params);
    }
  }

  private _logDecision(
    user: AuthorizedUser,
    action: string,
    effect: string,
    trace: PermissionTrace[],
  ) {
    if (process.env.NODE_ENV !== 'production' || effect === 'DENY') {
      const traceStr = trace
        .map((t) => `${t.rule}:${t.effect}${t.reason ? `(${t.reason.code})` : ''}`)
        .join(' -> ');
      this.logger.debug(`Permission ${effect} for ${user.email} on ${action}. Trace: ${traceStr}`);
    }
  }
}
