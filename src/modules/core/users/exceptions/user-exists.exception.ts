import { ConflictException } from '@nestjs/common';

import { UsersErrors } from '../users.errors';

export class UserExistsException extends ConflictException {
  constructor(email: string, status?: string) {
    let message: string;

    if (status === 'INVITED') {
      message = UsersErrors.userEmailExistsAndInvited(email);
    } else if (status === 'ACTIVE' || status === 'BLOCKED') {
      message = UsersErrors.userEmailExistsAndActive(email);
    } else {
      message = UsersErrors.userEmailExists(email);
    }

    super(message);
  }
}
