import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '@database/entities/department.entity';
import { User } from '@database/entities/user.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { OrganizationTreeBuilder } from './organization-tree.builder';
import { OrgChartNodeDto, OrgNodeType } from './dto/org-chart-node.dto';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly treeBuilder: OrganizationTreeBuilder,
  ) {}

  async getFullTree(currentUser: AuthorizedUser): Promise<{
    departments: OrgChartNodeDto[];
    employees: OrgChartNodeDto[];
  }> {
    const [departments, users] = await Promise.all([
      this.departmentsRepository.find({
        where: { company: { id: currentUser.companyId }, isActive: true },
        relations: ['parentDepartment'],
      }),
      this.usersRepository.find({
        where: { company: { id: currentUser.companyId } },
        relations: ['position'],
      }),
    ]);

    return {
      departments: this.treeBuilder.buildDepartmentTree(departments),
      employees: this.treeBuilder.buildEmployeeTree(users),
    };
  }

  async getDepartmentTree(
    departmentId: string,
    currentUser: AuthorizedUser,
  ): Promise<OrgChartNodeDto[]> {
    const departments = await this.departmentsRepository.find({
      where: { company: { id: currentUser.companyId }, isActive: true },
      relations: ['parentDepartment'],
    });

    const fullTree = this.treeBuilder.buildDepartmentTree(departments);

    // Find the specific department node in the tree
    const findNode = (nodes: OrgChartNodeDto[]): OrgChartNodeDto | null => {
      for (const node of nodes) {
        if (node.id === departmentId) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    const targetNode = findNode(fullTree);
    if (!targetNode) {
      throw ExceptionFactory.departmentNotFound(departmentId);
    }

    return [targetNode];
  }

  async getEmployeeContext(
    employeeId: string,
    currentUser: AuthorizedUser,
  ): Promise<{
    managerChain: OrgChartNodeDto[];
    directReports: OrgChartNodeDto[];
  }> {
    const users = await this.usersRepository.find({
      where: { company: { id: currentUser.companyId } },
      relations: ['position'],
    });

    const user = users.find((u) => u.id === employeeId);
    if (!user) {
      throw ExceptionFactory.userWithIdNotFound(employeeId);
    }

    const nodeMap = new Map<string, OrgChartNodeDto>();
    users.forEach((u) => {
      nodeMap.set(u.id, {
        id: u.id,
        entityType: OrgNodeType.EMPLOYEE,
        title: `${u.firstName} ${u.lastName}`,
        subtitle: u.position?.title || undefined,
        avatar: u.avatar,
        parentId: u.managerId,
        children: [],
      });
    });

    // Manager chain
    const managerChain: OrgChartNodeDto[] = [];
    let currentManagerId = user.managerId;
    while (currentManagerId && nodeMap.has(currentManagerId)) {
      const managerNode = nodeMap.get(currentManagerId)!;
      managerChain.unshift(managerNode);
      currentManagerId = users.find((u) => u.id === currentManagerId)?.managerId || null;
    }

    // Direct reports
    const directReports = users
      .filter((u) => u.managerId === employeeId)
      .map((u) => nodeMap.get(u.id)!);

    return {
      managerChain,
      directReports,
    };
  }
}
