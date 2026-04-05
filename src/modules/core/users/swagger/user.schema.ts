import { ApiProperty } from '@nestjs/swagger';

import { User } from '@database/entities/user.entity';
import { UserRole } from '@/database/enums';

export class UserResponse implements Partial<User> {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier',
  })
  id: string;

  @ApiProperty({ example: 'John', description: 'First name', maxLength: 100 })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', maxLength: 100 })
  lastName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({
    example: '+380501234567',
    description: 'Phone number',
    required: false,
  })
  phone: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar: string;
}
