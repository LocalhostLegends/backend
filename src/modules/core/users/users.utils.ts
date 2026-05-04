import { User } from '@database/entities/user.entity';
import { transformToDto } from '@common/utils/dto.utils';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Utility for mapping a User entity to a UserResponseDto.
 * Encapsulates explicit role conversion logic and ensures type safety.
 */
export function toUserResponse(user: User): UserResponseDto;
export function toUserResponse(users: User[]): UserResponseDto[];
export function toUserResponse(data: User | User[]): UserResponseDto | UserResponseDto[] {
  const mapSingle = (user: User) => ({
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
    lastLoginAt: user.lastLoginAt,
    dateOfBirth: user.dateOfBirth,
    hireDate: user.hireDate,
    roles: user.roles?.map((role) => role.code) ?? [],
  });

  if (Array.isArray(data)) {
    return transformToDto(UserResponseDto, data.map(mapSingle));
  }

  return transformToDto(UserResponseDto, mapSingle(data));
}
