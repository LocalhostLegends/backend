import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';

import { OrganizationStructureService } from './organization-structure.service';
import { swagger } from './swagger';

@swagger.ApiTags()
@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationStructureController {
  constructor(private readonly structureService: OrganizationStructureService) {}

  @Get('tree')
  @swagger.ApiGetFullTree()
  async getFullTree(@CurrentUser() currentUser: AuthorizedUser) {
    return this.structureService.getFullTree(currentUser);
  }

  @Get('departments/:id/tree')
  @swagger.ApiGetDepartmentTree()
  async getDepartmentTree(@Param('id') id: string, @CurrentUser() currentUser: AuthorizedUser) {
    return this.structureService.getDepartmentTree(id, currentUser);
  }

  @Get('employees/:id/context')
  @swagger.ApiGetEmployeeContext()
  async getEmployeeContext(@Param('id') id: string, @CurrentUser() currentUser: AuthorizedUser) {
    return this.structureService.getEmployeeContext(id, currentUser);
  }
}
