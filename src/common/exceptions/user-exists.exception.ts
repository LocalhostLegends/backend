import { ConflictException } from '@nestjs/common';
import { ErrorMessages } from './error-messages';

export class UserExistsException extends ConflictException {
  constructor(email: string, status?: string) {
    let message: string;

    if (status === 'INVITED') {
      message = ErrorMessages.USER_EMAIL_EXISTS_AND_INVITED(email);
    } else if (status === 'ACTIVE' || status === 'BLOCKED') {
      message = ErrorMessages.USER_EMAIL_EXISTS_AND_ACTIVE(email);
    } else {
      message = ErrorMessages.USER_EMAIL_EXISTS(email);
    }

    super(message);
  }
}
