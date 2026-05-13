import { OrganizationTreeBuilder } from './organization-tree.builder';
import { Department } from '@database/entities/department.entity';
import { User } from '@database/entities/user.entity';
import { OrgNodeType } from './dto/org-chart-node.dto';

describe('OrganizationTreeBuilder', () => {
  let builder: OrganizationTreeBuilder;

  beforeEach(() => {
    builder = new OrganizationTreeBuilder();
  });

  describe('buildDepartmentTree', () => {
    it('should build a hierarchical department tree', () => {
      const depts = [
        { id: '1', name: 'Engineering', parentDepartment: null } as Department,
        { id: '2', name: 'Backend', parentDepartment: { id: '1' } } as Department,
        { id: '3', name: 'Frontend', parentDepartment: { id: '1' } } as Department,
        { id: '4', name: 'HR', parentDepartment: null } as Department,
      ];

      const tree = builder.buildDepartmentTree(depts);

      expect(tree).toHaveLength(2);
      expect(tree.find((n) => n.id === '1')?.children).toHaveLength(2);
      expect(tree.find((n) => n.id === '4')?.children).toHaveLength(0);
      expect(tree[0].entityType).toBe(OrgNodeType.DEPARTMENT);
    });
  });

  describe('buildEmployeeTree', () => {
    it('should build a hierarchical employee tree', () => {
      const users = [
        { id: 'u1', firstName: 'CEO', lastName: 'Boss', managerId: null } as User,
        { id: 'u2', firstName: 'CTO', lastName: 'Tech', managerId: 'u1' } as User,
        {
          id: 'u3',
          firstName: 'Dev',
          lastName: 'One',
          managerId: 'u2',
          position: { title: 'Engineer' },
        } as User,
      ];

      const tree = builder.buildEmployeeTree(users);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('u1');
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe('u2');
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].title).toBe('Dev One');
      expect(tree[0].children[0].children[0].subtitle).toBe('Engineer');
    });
  });
});
