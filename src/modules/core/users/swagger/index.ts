import {
  ApiUserTags,
  ApiFindAllUsers,
  ApiExportUsersCsv,
  ApiGetDirectory,
  ApiGetCurrentUser,
  ApiFindOneUser,
  ApiUpdateUser,
  ApiBlockUser,
  ApiUnblockUser,
  ApiRemoveUser,
  ApiUploadAvatar,
  ApiDeleteAvatar,
  ApiUploadDocument,
  ApiFindAllDocuments,
  ApiFindOneDocument,
  ApiUpdateDocumentStatus,
  ApiRemoveDocument,
} from './users.decorators';
import { UserFields } from './user.fields';
import { DocumentFields } from './documents.fields';

export const swagger = {
  ApiTags: ApiUserTags,
  ApiFindAll: ApiFindAllUsers,
  ApiExportCsv: ApiExportUsersCsv,
  ApiGetDirectory: ApiGetDirectory,
  ApiGetCurrent: ApiGetCurrentUser,
  ApiFindOne: ApiFindOneUser,
  ApiUpdate: ApiUpdateUser,
  ApiBlock: ApiBlockUser,
  ApiUnblock: ApiUnblockUser,
  ApiRemove: ApiRemoveUser,
  ApiUploadAvatar: ApiUploadAvatar,
  ApiDeleteAvatar: ApiDeleteAvatar,
  ApiUploadDocument: ApiUploadDocument,
  ApiFindAllDocuments: ApiFindAllDocuments,
  ApiFindOneDocument: ApiFindOneDocument,
  ApiUpdateDocumentStatus: ApiUpdateDocumentStatus,
  ApiRemoveDocument: ApiRemoveDocument,
};

export { UserFields, DocumentFields };
