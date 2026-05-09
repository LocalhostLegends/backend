import {
  ApiUserTags,
  ApiFindAllUsers,
  ApiGetDirectory,
  ApiGetCurrentUser,
  ApiFindOneUser,
  ApiUpdateUser,
  ApiBlockUser,
  ApiUnblockUser,
  ApiRemoveUser,
  ApiUploadAvatar,
  ApiDeleteAvatar,
} from './users.decorators';
import { UserFields } from './user.fields';

export const swagger = {
  ApiTags: ApiUserTags,
  ApiFindAll: ApiFindAllUsers,
  ApiGetDirectory: ApiGetDirectory,
  ApiGetCurrent: ApiGetCurrentUser,
  ApiFindOne: ApiFindOneUser,
  ApiUpdate: ApiUpdateUser,
  ApiBlock: ApiBlockUser,
  ApiUnblock: ApiUnblockUser,
  ApiRemove: ApiRemoveUser,
  ApiUploadAvatar: ApiUploadAvatar,
  ApiDeleteAvatar: ApiDeleteAvatar,
};

export { UserFields };
