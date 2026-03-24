import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { AuthorizedUser } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthorizedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthorizedUser }>();
    
    return request.user;
  },
);