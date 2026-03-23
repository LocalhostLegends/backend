import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseSchema {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  accessToken: string;
}

export class RegisterBodySchema {
  @ApiProperty({ example: 'John', description: 'First name', maxLength: 100 })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', maxLength: 100 })
  lastName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 characters)', minLength: 6 })
  password: string;
}

export class LoginBodySchema {
  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  password: string;
}