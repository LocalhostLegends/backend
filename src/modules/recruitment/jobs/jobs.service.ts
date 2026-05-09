import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job } from '@database/entities/job.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';
import { EntityType } from '@common/enums/entity-type.enum';

import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

export type JobWithCustomFields = Job & { customFields: CustomFieldsMap; candidatesCount?: number };

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly _jobRepository: Repository<Job>,
    private readonly _permissions: PermissionsService,
    private readonly _customFieldsService: CustomFieldsService,
  ) {}

  async create(createJobDto: CreateJobDto, user: AuthorizedUser): Promise<JobWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.JOB_CREATE);

    const { customFields, ...jobData } = createJobDto;

    const job = this._jobRepository.create({
      ...jobData,
      companyId: user.companyId,
      creatorId: user.id,
    });

    const savedJob = await this._jobRepository.save(job);

    if (customFields) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.JOB,
        savedJob.id,
        customFields,
      );
    }

    return this.findOne(savedJob.id, user);
  }

  async findAll(user: AuthorizedUser): Promise<JobWithCustomFields[]> {
    await this._permissions.assertCan(user, PermissionAction.JOB_READ);

    const jobs = await this._jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.creator', 'creator')
      .loadRelationCountAndMap('job.candidatesCount', 'job.applications')
      .where('job.companyId = :companyId', { companyId: user.companyId })
      .orderBy('job.createdAt', 'DESC')
      .getMany();

    if (jobs.length === 0) return [];

    const jobIds = jobs.map((job) => job.id);
    const customFields = await this._customFieldsService.getValuesForMultipleEntities(
      user.companyId,
      EntityType.JOB,
      jobIds,
    );

    const customFieldsMap = new Map<string, CustomFieldsMap>();
    customFields.forEach((cf) => {
      let entry = customFieldsMap.get(cf.entityId);
      if (!entry) {
        entry = {};
        customFieldsMap.set(cf.entityId, entry);
      }
      entry[cf.fieldKey] = cf.value;
    });

    return jobs.map((job) => ({
      ...job,
      customFields: customFieldsMap.get(job.id) || {},
    }));
  }

  async findOne(id: string, user: AuthorizedUser): Promise<JobWithCustomFields> {
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

    const customFields = await this._customFieldsService.getValues(
      user.companyId,
      EntityType.JOB,
      job.id,
    );

    return {
      ...job,
      customFields,
    };
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    user: AuthorizedUser,
  ): Promise<JobWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.JOB_UPDATE);

    const job = await this._jobRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!job) {
      throw ExceptionFactory.jobNotFound(id);
    }

    const { customFields, ...jobData } = updateJobDto;

    Object.assign(job, jobData);

    const savedJob = await this._jobRepository.save(job);

    if (customFields !== undefined) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.JOB,
        savedJob.id,
        customFields,
      );
    }

    return this.findOne(savedJob.id, user);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.JOB_DELETE);

    const job = await this._jobRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!job) {
      throw ExceptionFactory.jobNotFound(id);
    }

    await this._jobRepository.softRemove(job);
  }
}
