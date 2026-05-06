import { Invite } from '@database/entities/invite.entity';
import { transformToDto } from '@common/utils/dto.utils';
import { InviteResponseDto } from './dto/invite-response.dto';

/**
 * Utility for mapping an Invite entity to an InviteResponseDto.
 */
export function toInviteResponse(invite: Invite): InviteResponseDto;
export function toInviteResponse(invites: Invite[]): InviteResponseDto[];
export function toInviteResponse(data: Invite | Invite[]): InviteResponseDto | InviteResponseDto[] {
  const mapSingle = (invite: Invite) => ({
    id: invite.id,
    email: invite.email,
    token: invite.token,
    status: invite.status,
    role: invite.role,
    companyId: invite.company?.id,
    invitedById: invite.invitedBy?.id,
    departmentId: invite.department?.id || null,
    positionId: invite.position?.id || null,
    expiresAt: invite.expiresAt,
    acceptedAt: invite.acceptedAt,
  });

  if (Array.isArray(data)) {
    return transformToDto(InviteResponseDto, data.map(mapSingle));
  }

  return transformToDto(InviteResponseDto, mapSingle(data));
}
