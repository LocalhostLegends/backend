import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Bonus } from '@database/entities/bonus.entity';
import { CreateBonusDto } from './dto/bonus.dto';
import { BonusStatus } from '@common/enums/bonus-status.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(Bonus)
    private readonly bonusRepository: Repository<Bonus>,
  ) {}

  async create(dto: CreateBonusDto, currentUser: AuthorizedUser): Promise<Bonus> {
    const isAdmin = currentUser.roles.some((role) =>
      ['admin', 'super_admin'].includes(role.toLowerCase()),
    );

    const bonusDate = dto.date || dto.effectiveDate;
    if (!bonusDate) {
      throw new Error('Date is required');
    }

    const bonus = this.bonusRepository.create({
      ...dto,
      companyId: currentUser.companyId,
      status: dto.status || (isAdmin ? BonusStatus.APPROVED : BonusStatus.PENDING),
      date: new Date(bonusDate),
    });
    return this.bonusRepository.save(bonus);
  }

  async updateStatus(id: string, status: BonusStatus, companyId: string): Promise<Bonus> {
    const bonus = await this.bonusRepository.findOne({
      where: { id, companyId },
    });
    if (!bonus) {
      throw new NotFoundException(`Bonus with ID ${id} not found`);
    }
    bonus.status = status;
    return this.bonusRepository.save(bonus);
  }

  async findAll(companyId: string, userId?: string): Promise<Bonus[]> {
    const where: FindOptionsWhere<Bonus> = { companyId };
    if (userId) {
      where.userId = userId;
    }
    return this.bonusRepository.find({
      where,
      order: { date: 'DESC' },
      relations: ['user'],
    });
  }
}
