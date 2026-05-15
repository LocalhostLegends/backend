import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Salary } from '@database/entities/salary.entity';
import { SalaryRevision } from '@database/entities/salary-revision.entity';
import { SalaryRevisionRequest } from '@database/entities/salary-revision-request.entity';
import { UpdateSalaryDto } from './dto/salary.dto';
import {
  CreateSalaryRevisionRequestDto,
  ReviewSalaryRevisionRequestDto,
} from './dto/revision-request.dto';
import { SalaryRevisionStatus } from '@common/enums/salary-revision-status.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';

@Injectable()
export class CompensationService {
  constructor(
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
    @InjectRepository(SalaryRevision)
    private readonly revisionRepository: Repository<SalaryRevision>,
    @InjectRepository(SalaryRevisionRequest)
    private readonly requestRepository: Repository<SalaryRevisionRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async getSalary(userId: string, companyId: string): Promise<Salary> {
    const salary = await this.salaryRepository.findOne({
      where: { userId, companyId },
    });
    if (!salary) {
      throw new NotFoundException(`Salary not found for user ${userId}`);
    }
    return salary;
  }

  async updateSalary(
    userId: string,
    updateDto: UpdateSalaryDto,
    currentUser: AuthorizedUser,
  ): Promise<Salary> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let salary = await queryRunner.manager.findOne(Salary, {
        where: { userId, companyId: currentUser.companyId },
      });

      const oldAmount = salary ? salary.amount : 0;

      if (!salary) {
        salary = queryRunner.manager.create(Salary, {
          ...updateDto,
          userId,
          companyId: currentUser.companyId,
          effectiveDate: new Date(updateDto.effectiveDate),
        });
      } else {
        salary.amount = updateDto.amount;
        salary.currency = updateDto.currency;
        salary.payFrequency = updateDto.payFrequency;
        salary.effectiveDate = new Date(updateDto.effectiveDate);
      }

      const savedSalary = await queryRunner.manager.save(salary);

      const revision = queryRunner.manager.create(SalaryRevision, {
        userId,
        companyId: currentUser.companyId,
        oldAmount,
        newAmount: updateDto.amount,
        currency: updateDto.currency,
        reason: updateDto.reason,
        effectiveDate: new Date(updateDto.effectiveDate),
        changedById: currentUser.id,
      });

      await queryRunner.manager.save(revision);

      await queryRunner.commitTransaction();
      return savedSalary;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getHistory(userId: string, companyId: string): Promise<SalaryRevision[]> {
    return this.revisionRepository.find({
      where: { userId, companyId },
      order: { createdAt: 'DESC' },
      relations: ['changedBy'],
    });
  }

  // Salary Revision Requests
  async createRequest(
    dto: CreateSalaryRevisionRequestDto,
    user: AuthorizedUser,
  ): Promise<SalaryRevisionRequest> {
    const salary = await this.getSalary(user.id, user.companyId);

    const request = this.requestRepository.create({
      userId: user.id,
      companyId: user.companyId,
      currentAmount: salary.amount,
      requestedAmount: dto.requestedAmount,
      currency: salary.currency,
      reason: dto.reason,
      status: SalaryRevisionStatus.PENDING,
    });

    return this.requestRepository.save(request);
  }

  async getMyRequests(userId: string, companyId: string): Promise<SalaryRevisionRequest[]> {
    return this.requestRepository.find({
      where: { userId, companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllRequests(user: AuthorizedUser): Promise<SalaryRevisionRequest[]> {
    const isHR = user.roles.some((role) =>
      ['admin', 'super_admin', 'hr'].includes(role.toLowerCase()),
    );

    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .where('request.companyId = :companyId', { companyId: user.companyId });

    if (!isHR) {
      // If not HR, only show requests from employees managed by this user
      queryBuilder.andWhere('user.managerId = :managerId', { managerId: user.id });
    }

    return queryBuilder.orderBy('request.createdAt', 'DESC').getMany();
  }

  async reviewRequest(
    id: string,
    dto: ReviewSalaryRevisionRequestDto,
    currentUser: AuthorizedUser,
  ): Promise<SalaryRevisionRequest> {
    const request = await this.requestRepository.findOne({
      where: { id, companyId: currentUser.companyId },
      relations: ['user'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }

    if (
      request.status === SalaryRevisionStatus.APPROVED ||
      request.status === SalaryRevisionStatus.REJECTED
    ) {
      throw new BadRequestException('Request has already been finalized');
    }

    const isHR = currentUser.roles.some((role) =>
      ['admin', 'super_admin', 'hr'].includes(role.toLowerCase()),
    );

    // Role-based status transition logic
    if (!isHR) {
      // Manager logic
      if (dto.status === SalaryRevisionStatus.APPROVED) {
        // Manager can only approve to MANAGER_APPROVED stage
        request.status = SalaryRevisionStatus.MANAGER_APPROVED;
      } else {
        request.status = dto.status; // Manager can REJECT
      }
    } else {
      // HR logic
      request.status = dto.status; // HR can set any status (APPROVED, REJECTED, etc.)
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      request.reviewNote = dto.reviewNote ?? null;
      request.reviewedById = currentUser.id;
      request.reviewedAt = new Date();

      if (isHR && dto.status === SalaryRevisionStatus.APPROVED) {
        // Update the actual salary only on final HR approval
        await this.updateSalary(
          request.userId,
          {
            amount: Number(request.requestedAmount),
            currency: request.currency,
            reason: `Approved revision request: ${request.reason}`,
            effectiveDate: new Date().toISOString(),
            payFrequency: (await this.getSalary(request.userId, request.companyId)).payFrequency,
          },
          currentUser,
        );
      }

      const savedRequest = await queryRunner.manager.save(request);
      await queryRunner.commitTransaction();
      return savedRequest;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
