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
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';

import { CreateApplicationDto, UpdateApplicationStageDto } from './dto/application.dto';

export type ApplicationWithCustomFields = JobApplication & { customFields: CustomFieldsMap };

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
    private readonly _customFieldsService: CustomFieldsService,
  ) {}

  async create(
    createDto: CreateApplicationDto,
    user: AuthorizedUser,
  ): Promise<ApplicationWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_CREATE);

    const job = await this._jobRepository.findOne({
      where: { id: createDto.jobId, companyId: user.companyId },
    });
    if (!job) throw ExceptionFactory.jobNotFound(createDto.jobId);

    const candidate = await this._candidateRepository.findOne({
      where: { id: createDto.candidateId, companyId: user.companyId },
    });
    if (!candidate) throw ExceptionFactory.candidateNotFound(createDto.candidateId);

    let application = await this._applicationRepository.findOne({
      where: { jobId: createDto.jobId, candidateId: createDto.candidateId },
    });

    if (!application) {
      const { customFields, ...applicationData } = createDto;
      application = this._applicationRepository.create(applicationData);
      application = await this._applicationRepository.save(application);

      if (customFields) {
        await this._customFieldsService.setValues(
          user.companyId,
          EntityType.JOB_APPLICATION,
          application.id,
          customFields,
        );
      }
    }

    return this.findOne(application.id, user);
  }

  async findOne(id: string, user: AuthorizedUser): Promise<ApplicationWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_READ);

    const application = await this._applicationRepository.findOne({
      where: { id, job: { companyId: user.companyId } },
      relations: ['job', 'candidate'],
    });

    if (!application) {
      throw ExceptionFactory.applicationNotFound(id);
    }

    const customFields = await this._customFieldsService.getValues(
      user.companyId,
      EntityType.JOB_APPLICATION,
      application.id,
    );

    return {
      ...application,
      customFields,
    };
  }

  async findByJob(jobId: string, user: AuthorizedUser): Promise<ApplicationWithCustomFields[]> {
    await this._permissions.assertCan(user, PermissionAction.APPLICATION_READ);

    const applications = await this._applicationRepository.find({
      where: { jobId, job: { companyId: user.companyId } },
      relations: ['candidate'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });

    if (applications.length === 0) return [];

    const appIds = applications.map((a) => a.id);
    const customFields = await this._customFieldsService.getValuesForMultipleEntities(
      user.companyId,
      EntityType.JOB_APPLICATION,
      appIds,
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

    return applications.map((a) => ({
      ...a,
      customFields: customFieldsMap.get(a.id) || {},
    }));
  }

  async updateStage(
    id: string,
    updateDto: UpdateApplicationStageDto,
    user: AuthorizedUser,
  ): Promise<ApplicationWithCustomFields> {
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

    const saved = await this._applicationRepository.save(application);
    return this.findOne(saved.id, user);
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
