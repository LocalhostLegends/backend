import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Candidate } from '@database/entities/candidate.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
    private readonly _permissions: PermissionsService,
  ) {}

  async create(createDto: CreateCandidateDto, user: AuthorizedUser): Promise<Candidate> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_CREATE);

    const candidate = this._candidateRepository.create({
      ...createDto,
      companyId: user.companyId,
    });

    return this._candidateRepository.save(candidate);
  }

  async findAll(user: AuthorizedUser): Promise<Candidate[]> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_READ);
    return this._candidateRepository.find({ where: { companyId: user.companyId } });
  }

  async findOne(id: string, user: AuthorizedUser): Promise<Candidate> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_READ);

    const candidate = await this._candidateRepository.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!candidate) {
      throw ExceptionFactory.candidateNotFound(id);
    }

    return candidate;
  }

  async update(
    id: string,
    updateDto: UpdateCandidateDto,
    user: AuthorizedUser,
  ): Promise<Candidate> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_UPDATE);

    const candidate = await this.findOne(id, user);

    Object.assign(candidate, updateDto);

    return this._candidateRepository.save(candidate);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    await this._permissions.assertCan(user, PermissionAction.CANDIDATE_DELETE);

    const candidate = await this.findOne(id, user);

    await this._candidateRepository.softRemove(candidate);
  }
}
