import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';

import { departmentsData } from './data/departments.data';
import { positionsData } from './data/positions.data';
import { usersData } from './data/users.data';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly _departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private readonly _positionRepository: Repository<Position>,
  ) { }

 async onModuleInit() {
  if (process.env.NODE_ENV !== 'production') {
    await this.seed().catch(err => {
      this.logger.error('Seeding failed:', err);
    });
  }
}

  async seed() {
    const departmentCount = await this._departmentRepository.count();

    if (departmentCount > 0) {
      this.logger.log('Database already seeded');
      return;
    }

    this.logger.log('Starting seeding...');

    try {
      const departments = await this._departmentRepository.save(
        departmentsData.map(d => this._departmentRepository.create(d))
      );
      this.logger.log(`✓ ${departments.length} departments created`);

      const positions = await this._positionRepository.save(
        positionsData.map(p => this._positionRepository.create(p))
      );
      this.logger.log(`✓ ${positions.length} positions created`);

      const hashedPassword = await bcrypt.hash('123456', 10);

      await this._userRepository.save(
        usersData.map(u => this._userRepository.create({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          department: departments[u.departmentIndex],
          position: positions[u.positionIndex],
        }))
      );
      this.logger.log('✓ 2 HR and 3 employees created');

      this.logger.log('✓ Seeding completed!');
    } catch (error) {
      this.logger.error('Seeding failed', error);
    }
  }
}