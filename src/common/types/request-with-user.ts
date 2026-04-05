import { Request } from 'express';
import { AuthorizedUser } from '../../modules/core/auth/auth.types';

export interface RequestWithUser extends Request {
  user: AuthorizedUser;
}
