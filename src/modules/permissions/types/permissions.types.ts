import { UserRole } from '@common/enums/user-role.enum';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { ExceptionParams } from '@common/exceptions/exception.types';

export interface IOwnable {
  id?: string | number;
  companyId?: string | null;
  departmentId?: string | null;
  userId?: string | null;
  roles?: UserRole[];
  status?: string;
}

export interface WrappedResource extends IOwnable {
  old?: WrappedResource;
  new?: Record<string, unknown>;
}

export type PermissionResource = WrappedResource | IOwnable | object;

export function isWrappedResource(res: unknown): res is WrappedResource {
  return typeof res === 'object' && res !== null && ('new' in res || 'old' in res);
}

export function getSafeProperty<T = unknown>(obj: unknown, key: string): T | undefined {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as Record<string, T>)[key];
  }
  return undefined;
}

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
