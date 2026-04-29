export const InviteErrors = {
  inviteNotFound: 'Invite not found',
  inviteHasExpired: 'Invite has expired',
  invalidInviteToken: 'Invalid invite token',
  forbiddenInviteAdmin: 'Cannot invite ADMIN users',
  inviteNotInCompany: (inviteId: string, companyId: string) =>
    `Invite with id "${inviteId}" is not in company with id "${companyId}"`,
  forbiddenResendInvite: (status: string) => `Cannot resend ${status} invite`,
  forbiddenCancelInvite: (status: string) => `Cannot cancel ${status} invite`,
  activeInviteExists: (email: string) => `An active invite already exists for email $${email}`,
  inviteStatus: (status: string) => `Invite is already ${status}`,
};
