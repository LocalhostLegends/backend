import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { UserRolesGuard } from '@common/guards/user-roles.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { type AuthorizedUser } from '@common/types/authorized-user.type';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { DepartmentSwagger } from './swagger/departments.swagger';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@RequireRole('hr')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @DepartmentSwagger.create()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return plainToInstance(
      DepartmentResponseDto,
      await this.departmentsService.create(createDepartmentDto, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Get()
  @DepartmentSwagger.findAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser) {
    return plainToInstance(
      DepartmentResponseDto,
      await this.departmentsService.findAll(currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Get(':id')
  @DepartmentSwagger.findOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return plainToInstance(
      DepartmentResponseDto,
      await this.departmentsService.findOne(id, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Patch(':id')
  @DepartmentSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return plainToInstance(
      DepartmentResponseDto,
      await this.departmentsService.update(id, updateDepartmentDto, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Delete(':id')
  @DepartmentSwagger.delete()
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: AuthorizedUser) {
    return this.departmentsService.remove(id, currentUser);
  }
}
