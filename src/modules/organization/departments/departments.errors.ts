export const DepartmentsErrors = {
  departmentNotInCompany: (departmentId: string, companyId: string) =>
    `Department with id "${departmentId}" is not in company with id "${companyId}"`,
  departmentNotFound: (id: string) => `Department with id "${id}" not found`,
  departmentNameExists: (name: string) => `Department with name "${name}" already exists`,
};
