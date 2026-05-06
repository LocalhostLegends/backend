import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Candidate } from '@database/entities/candidate.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreateCandidateDto } from './dto/create-candidate.dto';

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
}
