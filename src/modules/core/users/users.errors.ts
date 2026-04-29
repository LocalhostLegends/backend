export const UsersErrors = {
  userNotFound: 'User not found',
  userNotActive: 'User account is not active',
  userInvited: 'User account has been invited',
  userBlocked: 'User account has been blocked',
  userDeleted: 'User account has been deleted',
  userWithIdNotFound: (id: string) => `User with id "${id}" not found`,
  userEmailExists: (email: string) => `User with email "${email}" already exists`,
  userEmailExistsAndActive: (email: string) =>
    `User with email "${email}" already exists and active`,
  userEmailExistsAndInvited: (email: string) =>
    `User with email "${email}" already exists and invited`,
};
