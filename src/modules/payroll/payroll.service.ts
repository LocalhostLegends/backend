import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, In } from 'typeorm';
import { PayrollPeriod } from '@database/entities/payroll-period.entity';
import { PayrollRecord } from '@database/entities/payroll-record.entity';
import { Salary } from '@database/entities/salary.entity';
import { Bonus } from '@database/entities/bonus.entity';
import { User } from '@database/entities/user.entity';
import { CreatePayrollPeriodDto } from './dto/payroll.dto';
import { PayrollPeriodStatus } from '@common/enums/payroll-period-status.enum';
import { PayrollRecordStatus } from '@common/enums/payroll-record-status.enum';
import { BonusStatus } from '@common/enums/bonus-status.enum';
import { UserStatus } from '@common/enums/user-status.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly periodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollRecord)
    private readonly recordRepository: Repository<PayrollRecord>,
    private readonly dataSource: DataSource,
  ) {}

  async createPeriod(dto: CreatePayrollPeriodDto, companyId: string): Promise<PayrollPeriod> {
    const period = this.periodRepository.create({
      ...dto,
      companyId,
      status: PayrollPeriodStatus.DRAFT,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return this.periodRepository.save(period);
  }

  async generateRecords(periodId: string, companyId: string): Promise<PayrollRecord[]> {
    const period = await this.periodRepository.findOne({
      where: { id: periodId, companyId },
    });

    if (!period) {
      throw new NotFoundException(`Payroll period ${periodId} not found`);
    }

    if (period.status !== PayrollPeriodStatus.DRAFT && period.status !== PayrollPeriodStatus.OPEN) {
      throw new BadRequestException('Cannot generate records for this period status');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get all active employees
      const employees = await queryRunner.manager.find(User, {
        where: { company: { id: companyId }, status: UserStatus.ACTIVE },
      });

      const employeeIds = employees.map((e) => e.id);

      // 2. Get their current salaries
      const salaries = await queryRunner.manager.find(Salary, {
        where: { userId: In(employeeIds), companyId },
      });

      const salaryMap = new Map(salaries.map((s) => [s.userId, s]));

      // 3. Get approved bonuses for this period
      const bonuses = await queryRunner.manager.find(Bonus, {
        where: {
          companyId,
          status: BonusStatus.APPROVED,
          date: Between(period.startDate, period.endDate),
        },
      });

      const bonusMap = new Map<string, number>();
      bonuses.forEach((b) => {
        const current = bonusMap.get(b.userId) || 0;
        bonusMap.set(b.userId, current + Number(b.amount));
      });

      // 4. Create records
      const records: PayrollRecord[] = [];
      let periodTotal = 0;

      for (const employee of employees) {
        const salary = salaryMap.get(employee.id);
        if (!salary) continue;

        const baseSalary = Number(salary.amount);
        const bonusesAmount = bonusMap.get(employee.id) || 0;
        const totalNet = baseSalary + bonusesAmount;

        periodTotal += totalNet;

        let record = await queryRunner.manager.findOne(PayrollRecord, {
          where: { payrollPeriodId: periodId, userId: employee.id },
        });

        if (record) {
          record.baseSalary = baseSalary;
          record.bonusesAmount = bonusesAmount;
          record.totalNet = totalNet;
          record.currency = period.currency;
        } else {
          record = queryRunner.manager.create(PayrollRecord, {
            payrollPeriodId: periodId,
            userId: employee.id,
            baseSalary,
            bonusesAmount,
            totalNet,
            currency: period.currency,
            status: PayrollRecordStatus.PENDING,
          });
        }
        records.push(record);
      }

      const savedRecords = await queryRunner.manager.save(records);

      period.totalAmount = periodTotal;
      period.status = PayrollPeriodStatus.OPEN;
      await queryRunner.manager.save(period);

      await queryRunner.commitTransaction();
      return savedRecords;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllPeriods(companyId: string): Promise<PayrollPeriod[]> {
    return this.periodRepository.find({
      where: { companyId },
      order: { startDate: 'DESC' },
    });
  }

  async getMyPayrollHistory(userId: string, companyId: string): Promise<PayrollRecord[]> {
    return this.recordRepository.find({
      where: {
        userId,
        payrollPeriod: { companyId },
        status: PayrollRecordStatus.PAID,
      },
      relations: ['payrollPeriod'],
      order: { payrollPeriod: { endDate: 'DESC' } },
    });
  }

  async getPeriodRecords(periodId: string, companyId: string): Promise<PayrollRecord[]> {
    return this.recordRepository.find({
      where: { payrollPeriodId: periodId, payrollPeriod: { companyId } },
      relations: ['user'],
    });
  }

  async getPeriodById(id: string, companyId: string): Promise<PayrollPeriod> {
    const period = await this.periodRepository.findOne({
      where: { id, companyId },
    });

    if (!period) {
      throw new NotFoundException(`Payroll period ${id} not found`);
    }

    return period;
  }

  async updatePeriodStatus(
    id: string,
    companyId: string,
    newStatus: PayrollPeriodStatus,
    user: AuthorizedUser,
  ): Promise<PayrollPeriod> {
    const period = await this.getPeriodById(id, companyId);
    const oldStatus = period.status;

    if (oldStatus === newStatus) {
      return period;
    }

    // Role-based validation
    const isAdmin =
      user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN);
    const isHR = user.roles.includes(UserRole.HR);

    if (newStatus === PayrollPeriodStatus.PAID && !isAdmin) {
      throw new BadRequestException('Only Admins can mark payroll as PAID');
    }

    if (newStatus === PayrollPeriodStatus.PENDING_APPROVAL && !(isAdmin || isHR)) {
      throw new BadRequestException('Only HR or Admins can send payroll for approval');
    }

    // Status transition validation
    if (
      newStatus === PayrollPeriodStatus.PENDING_APPROVAL &&
      oldStatus === PayrollPeriodStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Cannot send for approval before generating records (must be OPEN)',
      );
    }

    if (newStatus === PayrollPeriodStatus.PAID && oldStatus === PayrollPeriodStatus.DRAFT) {
      throw new BadRequestException('Cannot pay before generating records');
    }

    period.status = newStatus;

    // Side effects when marked as PAID
    if (newStatus === PayrollPeriodStatus.PAID) {
      await this.dataSource.transaction(async (manager) => {
        // 1. Update all related records to PAID
        await manager.update(
          PayrollRecord,
          { payrollPeriodId: id },
          { status: PayrollRecordStatus.PAID },
        );

        // 2. Update all associated bonuses to PAID
        // Bonuses are linked via payroll_record_id, and those records belong to this period
        const records = await manager.find(PayrollRecord, {
          where: { payrollPeriodId: id },
          select: ['id'],
        });
        const recordIds = records.map((r) => r.id);

        if (recordIds.length > 0) {
          await manager.update(
            Bonus,
            { payrollRecordId: In(recordIds) },
            { status: BonusStatus.PAID },
          );
        }

        await manager.save(period);
      });
    } else {
      await this.periodRepository.save(period);
    }

    return period;
  }
}
