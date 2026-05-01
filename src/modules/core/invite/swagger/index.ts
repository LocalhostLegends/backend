import * as inviteDecorators from './invite.decorators';
import { InviteFields } from './invite.fields';

export const swagger = {
  ApiTags: inviteDecorators.ApiInviteTags,
  ApiCreateInvite: inviteDecorators.ApiCreateInvite,
  ApiValidateInvite: inviteDecorators.ApiValidateInvite,
  ApiAcceptInvite: inviteDecorators.ApiAcceptInvite,
  ApiResendInvite: inviteDecorators.ApiResendInvite,
  ApiCancelInvite: inviteDecorators.ApiCancelInvite,
  ApiGetCompanyInvites: inviteDecorators.ApiGetCompanyInvites,
  ApiGetPendingInvites: inviteDecorators.ApiGetPendingInvites,
};

export { InviteFields };
