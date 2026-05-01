import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';
import { ExceptionCode } from './exception-codes';

export class ExceptionFactory {
  // Users
  static userNotFound() {
    return new AppException(ExceptionCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  static userWithIdNotFound(id: string) {
    return new AppException(ExceptionCode.USER_WITH_ID_NOT_FOUND, HttpStatus.NOT_FOUND, [id]);
  }

  static userEmailExists(email: string) {
    return new AppException(ExceptionCode.USER_EMAIL_EXISTS, HttpStatus.CONFLICT, [email]);
  }

  static userEmailExistsAndActive(email: string) {
    return new AppException(ExceptionCode.USER_EMAIL_EXISTS_AND_ACTIVE, HttpStatus.CONFLICT, [
      email,
    ]);
  }

  static userEmailExistsAndInvited(email: string) {
    return new AppException(ExceptionCode.USER_EMAIL_EXISTS_AND_INVITED, HttpStatus.CONFLICT, [
      email,
    ]);
  }

  static userNotActive() {
    return new AppException(ExceptionCode.USER_NOT_ACTIVE, HttpStatus.FORBIDDEN);
  }

  static userInvited() {
    return new AppException(ExceptionCode.USER_INVITED, HttpStatus.FORBIDDEN);
  }

  static userBlocked() {
    return new AppException(ExceptionCode.USER_BLOCKED, HttpStatus.FORBIDDEN);
  }

  static userDeleted() {
    return new AppException(ExceptionCode.USER_DELETED, HttpStatus.FORBIDDEN);
  }

  // Departments
  static departmentNotFound(id: string) {
    return new AppException(ExceptionCode.DEPARTMENT_NOT_FOUND, HttpStatus.NOT_FOUND, [id]);
  }

  static departmentNameExists(name: string) {
    return new AppException(ExceptionCode.DEPARTMENT_NAME_EXISTS, HttpStatus.CONFLICT, [name]);
  }

  static departmentNotInCompany(departmentId: string, companyId: string) {
    return new AppException(ExceptionCode.DEPARTMENT_NOT_IN_COMPANY, HttpStatus.FORBIDDEN, [
      departmentId,
      companyId,
    ]);
  }

  // Positions
  static positionNotFound(id: string) {
    return new AppException(ExceptionCode.POSITION_NOT_FOUND, HttpStatus.NOT_FOUND, [id]);
  }

  static positionTitleExists(title: string) {
    return new AppException(ExceptionCode.POSITION_TITLE_EXISTS, HttpStatus.CONFLICT, [title]);
  }

  static positionNotInCompany(positionId: string, companyId: string) {
    return new AppException(ExceptionCode.POSITION_NOT_IN_COMPANY, HttpStatus.FORBIDDEN, [
      positionId,
      companyId,
    ]);
  }

  // Invites
  static inviteNotFound() {
    return new AppException(ExceptionCode.INVITE_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  static inviteExpired() {
    return new AppException(ExceptionCode.INVITE_EXPIRED, HttpStatus.GONE);
  }

  static inviteInvalidToken() {
    return new AppException(ExceptionCode.INVITE_INVALID_TOKEN, HttpStatus.BAD_REQUEST);
  }

  static inviteForbiddenAdmin() {
    return new AppException(ExceptionCode.INVITE_FORBIDDEN_ADMIN, HttpStatus.FORBIDDEN);
  }

  static inviteNotInCompany(inviteId: string, companyId: string) {
    return new AppException(ExceptionCode.INVITE_NOT_IN_COMPANY, HttpStatus.FORBIDDEN, [
      inviteId,
      companyId,
    ]);
  }

  static inviteCannotResend(status: string) {
    return new AppException(ExceptionCode.INVITE_CANNOT_RESEND, HttpStatus.BAD_REQUEST, [status]);
  }

  static inviteCannotCancel(status: string) {
    return new AppException(ExceptionCode.INVITE_CANNOT_CANCEL, HttpStatus.BAD_REQUEST, [status]);
  }

  static inviteActiveExists(email: string) {
    return new AppException(ExceptionCode.INVITE_ACTIVE_EXISTS, HttpStatus.CONFLICT, [email]);
  }

  static inviteAlreadyStatus(status: string) {
    return new AppException(ExceptionCode.INVITE_ALREADY_STATUS, HttpStatus.BAD_REQUEST, [status]);
  }

  // Auth
  static invalidCredentials() {
    return new AppException(ExceptionCode.AUTH_INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
  }

  static invalidToken() {
    return new AppException(ExceptionCode.AUTH_INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
  }

  static unauthorized() {
    return new AppException(ExceptionCode.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }

  static forbidden() {
    return new AppException(ExceptionCode.AUTH_FORBIDDEN, HttpStatus.FORBIDDEN);
  }

  static hasAdmin() {
    return new AppException(ExceptionCode.AUTH_HAS_ADMIN, HttpStatus.CONFLICT);
  }

  static forbiddenNonOwnershipAccess(resourceName: string) {
    return new AppException(ExceptionCode.AUTH_FORBIDDEN_NON_OWNERSHIP, HttpStatus.FORBIDDEN, [
      resourceName,
    ]);
  }

  static forbiddenResourceAccess(requiredRole: string, isOwnerable: boolean = true) {
    return new AppException(ExceptionCode.AUTH_FORBIDDEN_RESOURCE, HttpStatus.FORBIDDEN, [
      requiredRole,
      isOwnerable,
    ]);
  }

  // Companies
  static companyNotFound() {
    return new AppException(ExceptionCode.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  static companyWithIdNotFound(id: string) {
    return new AppException(ExceptionCode.COMPANY_WITH_ID_NOT_FOUND, HttpStatus.NOT_FOUND, [id]);
  }

  static companySubdomainTaken(subdomain: string) {
    return new AppException(ExceptionCode.COMPANY_SUBDOMAIN_TAKEN, HttpStatus.CONFLICT, [
      subdomain,
    ]);
  }

  // Common
  static commonRequiredField(field: string) {
    return new AppException(ExceptionCode.COMMON_REQUIRED_FIELD, HttpStatus.BAD_REQUEST, [field]);
  }
}
