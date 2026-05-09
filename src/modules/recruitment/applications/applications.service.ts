import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobApplication } from '@database/entities/job-application.entity';
import { Job } from '@database/entities/job.entity';
import { Candidate } from '@database/entities/candidate.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreateApplicationDto, UpdateApplicationStageDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly _applicationRepository: Repository<JobApplication>,
    @InjectRepository(Job)
    private readonly _jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
    private readonly _permissions: PermissionsService,
  ) {}

  async create(createDto: CreateApplicationDto, user: AuthorizedUser): Promise<JobApplication> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_CREATE);

    const job = await this._jobRepository.findOne({
      where: { id: createDto.jobId, companyId: user.companyId },
    });
    if (!job) throw ExceptionFactory.jobNotFound(createDto.jobId);

    const candidate = await this._candidateRepository.findOne({
      where: { id: createDto.candidateId, companyId: user.companyId },
    });
    if (!candidate) throw ExceptionFactory.candidateNotFound(createDto.candidateId);

    const existing = await this._applicationRepository.findOne({
      where: { jobId: createDto.jobId, candidateId: createDto.candidateId },
    });
    if (existing) return existing;

    const application = this._applicationRepository.create({
      ...createDto,
    });

    return this._applicationRepository.save(application);
  }

  async findByJob(jobId: string, user: AuthorizedUser): Promise<JobApplication[]> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_READ);

    return this._applicationRepository.find({
      where: { jobId, job: { companyId: user.companyId } },
      relations: ['candidate'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async updateStage(
    id: string,
    updateDto: UpdateApplicationStageDto,
    user: AuthorizedUser,
  ): Promise<JobApplication> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_UPDATE_STAGE);

    const application = await this._applicationRepository.findOne({
      where: { id, job: { companyId: user.companyId } },
      relations: ['job'],
    });

    if (!application) {
      throw ExceptionFactory.applicationNotFound(id);
    }

    application.stage = updateDto.stage;
    if (updateDto.order !== undefined) {
      application.order = updateDto.order;
    }

    return this._applicationRepository.save(application);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_DELETE);

    const application = await this._applicationRepository.findOne({
      where: { id, job: { companyId: user.companyId } },
    });

    if (!application) {
      throw ExceptionFactory.applicationNotFound(id);
    }

    await this._applicationRepository.softRemove(application);
  }
}
