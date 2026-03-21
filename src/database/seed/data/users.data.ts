import { UserRole } from '../../entities/user.entity.enums';

export const usersData = [
  { firstName: 'John', lastName: 'HR', email: 'hr1@test.com', role: UserRole.HR, departmentIndex: 0, positionIndex: 0 },
  { firstName: 'Jane', lastName: 'HR', email: 'hr2@test.com', role: UserRole.HR, departmentIndex: 0, positionIndex: 0 },
  { firstName: 'Alice', lastName: 'Smith', email: 'employee1@test.com', role: UserRole.EMPLOYEE, departmentIndex: 1, positionIndex: 1 },
  { firstName: 'Bob', lastName: 'Jones', email: 'employee2@test.com', role: UserRole.EMPLOYEE, departmentIndex: 2, positionIndex: 2 },
  { firstName: 'Charlie', lastName: 'Brown', email: 'employee3@test.com', role: UserRole.EMPLOYEE, departmentIndex: 1, positionIndex: 1 },
];