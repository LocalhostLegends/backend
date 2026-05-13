import { Injectable } from '@nestjs/common';
import { Department } from '@database/entities/department.entity';
import { User } from '@database/entities/user.entity';
import { OrgChartNodeDto, OrgNodeType } from './dto/org-chart-node.dto';

@Injectable()
export class OrganizationTreeBuilder {
  buildDepartmentTree(departments: Department[]): OrgChartNodeDto[] {
    const nodeMap = new Map<string, OrgChartNodeDto>();
    const roots: OrgChartNodeDto[] = [];

    // Create all nodes first
    departments.forEach((dept) => {
      nodeMap.set(dept.id, {
        id: dept.id,
        entityType: OrgNodeType.DEPARTMENT,
        title: dept.name,
        subtitle: dept.code || undefined,
        parentId: dept.parentDepartment?.id || null,
        children: [],
      });
    });

    // Build hierarchy
    departments.forEach((dept) => {
      const node = nodeMap.get(dept.id)!;
      const parentId = dept.parentDepartment?.id;

      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  buildEmployeeTree(users: User[]): OrgChartNodeDto[] {
    const nodeMap = new Map<string, OrgChartNodeDto>();
    const roots: OrgChartNodeDto[] = [];

    // Create all nodes first
    users.forEach((user) => {
      nodeMap.set(user.id, {
        id: user.id,
        entityType: OrgNodeType.EMPLOYEE,
        title: `${user.firstName} ${user.lastName}`,
        subtitle: user.position?.title || undefined,
        avatar: user.avatar,
        parentId: user.managerId,
        children: [],
      });
    });

    // Build hierarchy
    users.forEach((user) => {
      const node = nodeMap.get(user.id)!;
      const parentId = user.managerId;

      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
