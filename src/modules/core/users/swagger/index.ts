import * as userDecorators from './users.decorators';
import { UserFields } from './user.fields';
import { AvatarFields } from './avatar.fields';
import { UserFilterFields } from './user-filter.fields';

export const swagger = {
  ApiTags: userDecorators.ApiUserTags,
  ApiFindAll: userDecorators.ApiFindAllUsers,
  ApiGetCurrentUser: userDecorators.ApiGetCurrentUser,
  ApiGetUsersByRole: userDecorators.ApiGetUsersByRole,
  ApiGetUsersByStatus: userDecorators.ApiGetUsersByStatus,
  ApiFindOne: userDecorators.ApiFindOneUser,
  ApiUpdateUser: userDecorators.ApiUpdateUser,
  ApiBlockUser: userDecorators.ApiBlockUser,
  ApiUnblockUser: userDecorators.ApiUnblockUser,
  ApiRemoveUser: userDecorators.ApiRemoveUser,
  ApiUploadAvatar: userDecorators.ApiUploadAvatar,
  ApiDeleteAvatar: userDecorators.ApiDeleteAvatar,
};

export { UserFields, AvatarFields, UserFilterFields };
