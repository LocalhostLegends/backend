import { UserRole } from '@common/enums/user-role.enum';

export interface AuthorizedUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string;
  departmentId?: string | null;
  firstName?: string;
  lastName?: string;
}
