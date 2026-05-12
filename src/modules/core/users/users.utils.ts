import { User } from '@database/entities/user.entity';
import { transformToDto } from '@common/utils/dto.utils';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Utility for mapping a User entity to a UserResponseDto.
 * Encapsulates explicit role conversion logic and ensures type safety.
 */
export async function toUserResponse(
  data: User | User[],
  getPermissions?: (userId: string) => Promise<string[]>,
): Promise<UserResponseDto | UserResponseDto[]> {
  const mapSingle = async (user: User) => {
    const permissions = getPermissions ? await getPermissions(user.id) : [];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      phone: user.phone,
      avatar: user.avatar,
      department: user.department,
      position: user.position,
      company: user.company,
      manager: user.manager,
      managerId: user.managerId,
      lastLoginAt: user.security?.lastLoginAt,
      dateOfBirth: user.dateOfBirth,
      hireDate: user.hireDate,
      roles: user.roles?.map((role) => role.code) ?? [],
      permissions,
    };
  };

  if (Array.isArray(data)) {
    const items = await Promise.all(data.map(mapSingle));
    return transformToDto(UserResponseDto, items);
  }

  const mapped = await mapSingle(data);
  return transformToDto(UserResponseDto, mapped);
}
