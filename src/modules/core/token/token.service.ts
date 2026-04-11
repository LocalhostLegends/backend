import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { randomUUID } from 'crypto';

import { Token } from '@database/entities/token.entity';
import { TokenType } from '@database/enums/token-type.enum';
import { User } from '@database/entities/user.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly _tokenRepository: Repository<Token>,
  ) {}

  async createToken(
    userId: string | null,
    type: TokenType,
    hoursValid: number = 24,
    existingToken?: string,
  ): Promise<Token> {
    const token = existingToken || randomUUID();
    const expiresAt = new Date(Date.now() + hoursValid * 60 * 60 * 1000);

    const tokenEntity = new Token();
    tokenEntity.token = token;
    tokenEntity.type = type;
    tokenEntity.expiresAt = expiresAt;
    tokenEntity.isUsed = false;

    if (userId) {
      tokenEntity.user = { id: userId } as User;
    }

    const savedToken = await this._tokenRepository.save(tokenEntity);
    return savedToken;
  }

  async validateToken(token: string, type: TokenType): Promise<Token> {
    const tokenRecord = await this._tokenRepository.findOne({
      where: { token, type },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new NotFoundException('Invalid token');
    }

    if (tokenRecord.isUsed) {
      throw new BadRequestException('Token has already been used');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    return tokenRecord;
  }

  async markTokenAsUsed(id: string, ip?: string): Promise<void> {
    await this._tokenRepository.update(id, {
      isUsed: true,
      usedAt: new Date(),
      usedIp: ip || null,
    });
  }

  async revokeUserTokens(userId: string, type?: TokenType): Promise<number> {
    const where: { userId: string; isUsed: false; type?: TokenType } = { userId, isUsed: false };

    if (type) {
      where.type = type;
    }

    const result = await this._tokenRepository.update(where, {
      isUsed: true,
      usedAt: new Date(),
    });

    return result.affected || 0;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this._tokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  async getTokenByValue(token: string): Promise<Token | null> {
    return this._tokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async revokeToken(token: string): Promise<void> {
    await this._tokenRepository.delete({ token });
  }
}
