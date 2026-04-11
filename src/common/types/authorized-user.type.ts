import { UserRole } from '../enums/user-role.enum';

export interface AuthorizedUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string;
  firstName?: string;
  lastName?: string;
}
