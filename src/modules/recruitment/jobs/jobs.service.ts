import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job } from '@database/entities/job.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly _jobRepository: Repository<Job>,
    private readonly _permissions: PermissionsService,
  ) {}

  async create(createJobDto: CreateJobDto, user: AuthorizedUser): Promise<Job> {
    await this._permissions.assertCan(user, PermissionAction.JOB_CREATE);

    const job = this._jobRepository.create({
      ...createJobDto,
      companyId: user.companyId,
      creatorId: user.id,
    });

    return this._jobRepository.save(job);
  }

  async findAll(user: AuthorizedUser): Promise<Job[]> {
    await this._permissions.assertCan(user, PermissionAction.JOB_READ);

    return this._jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.creator', 'creator')
      .loadRelationCountAndMap('job.candidatesCount', 'job.applications')
      .where('job.companyId = :companyId', { companyId: user.companyId })
      .orderBy('job.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, user: AuthorizedUser): Promise<Job> {
    await this._permissions.assertCan(user, PermissionAction.JOB_READ);

    const job = await this._jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.creator', 'creator')
      .loadRelationCountAndMap('job.candidatesCount', 'job.applications')
      .where('job.id = :id', { id })
      .andWhere('job.companyId = :companyId', { companyId: user.companyId })
      .getOne();

    if (!job) {
      throw ExceptionFactory.jobNotFound(id);
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: AuthorizedUser): Promise<Job> {
    await this._permissions.assertCan(user, PermissionAction.JOB_UPDATE);

    const job = await this.findOne(id, user);

    Object.assign(job, updateJobDto);

    return this._jobRepository.save(job);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.JOB_DELETE);

    const job = await this.findOne(id, user);

    await this._jobRepository.softRemove(job);
  }
}
