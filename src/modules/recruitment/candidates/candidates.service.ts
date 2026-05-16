import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Candidate } from '@database/entities/candidate.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';

import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

export type CandidateWithCustomFields = Candidate & { customFields: CustomFieldsMap };

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
    private readonly _permissions: PermissionsService,
    private readonly _customFieldsService: CustomFieldsService,
  ) {}

  async create(
    createDto: CreateCandidateDto,
    user: AuthorizedUser,
  ): Promise<CandidateWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_CREATE);

    const { customFields, ...candidateData } = createDto;

    const candidate = this._candidateRepository.create({
      ...candidateData,
      companyId: user.companyId,
    });

    const savedCandidate = await this._candidateRepository.save(candidate);

    if (customFields) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.CANDIDATE,
        savedCandidate.id,
        customFields,
      );
    }

    return this.findOne(savedCandidate.id, user);
  }

  async findAll(user: AuthorizedUser): Promise<CandidateWithCustomFields[]> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_READ);
    const candidates = await this._candidateRepository.find({
      where: { companyId: user.companyId },
    });

    if (candidates.length === 0) return [];

    const candidateIds = candidates.map((c) => c.id);
    const customFields = await this._customFieldsService.getValuesForMultipleEntities(
      user.companyId,
      EntityType.CANDIDATE,
      candidateIds,
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

    return candidates.map((c) => ({
      ...c,
      customFields: customFieldsMap.get(c.id) || {},
    }));
  }

  async findOne(id: string, user: AuthorizedUser): Promise<CandidateWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_READ);

    const candidate = await this._candidateRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!candidate) {
      throw ExceptionFactory.candidateNotFound(id);
    }

    const customFields = await this._customFieldsService.getValues(
      user.companyId,
      EntityType.CANDIDATE,
      candidate.id,
    );

    return {
      ...candidate,
      customFields,
    };
  }

  async update(
    id: string,
    updateDto: UpdateCandidateDto,
    user: AuthorizedUser,
  ): Promise<CandidateWithCustomFields> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_UPDATE);

    const candidate = await this._candidateRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!candidate) {
      throw ExceptionFactory.candidateNotFound(id);
    }

    const { customFields, ...candidateData } = updateDto;

    Object.assign(candidate, candidateData);

    const savedCandidate = await this._candidateRepository.save(candidate);

    if (customFields !== undefined) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.CANDIDATE,
        savedCandidate.id,
        customFields,
      );
    }

    return this.findOne(savedCandidate.id, user);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_DELETE);

    const candidate = await this._candidateRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!candidate) {
      throw ExceptionFactory.candidateNotFound(id);
    }

    await this._candidateRepository.softRemove(candidate);
  }
}
