import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getAppRequestUser } from '@/common/utils/http.utils';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) =>
  getAppRequestUser(context),
);
