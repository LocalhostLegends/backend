import {
  ApiInviteTags,
  ApiCreateInvite,
  ApiValidateInvite,
  ApiAcceptInvite,
  ApiResendInvite,
  ApiCancelInvite,
  ApiGetCompanyInvites,
} from './invite.decorators';
import { InviteFields } from './invite.fields';

export const swagger = {
  ApiTags: ApiInviteTags,
  ApiCreate: ApiCreateInvite,
  ApiValidate: ApiValidateInvite,
  ApiAccept: ApiAcceptInvite,
  ApiResend: ApiResendInvite,
  ApiCancel: ApiCancelInvite,
  ApiGetCompany: ApiGetCompanyInvites,
};

export { InviteFields };
