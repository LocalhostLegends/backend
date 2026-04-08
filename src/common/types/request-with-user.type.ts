import { Request } from 'express';

import { AuthorizedUser } from './authorized-user.type';

export interface RequestWithUser extends Request {
  user: AuthorizedUser;
}
