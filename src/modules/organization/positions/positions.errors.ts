export const PositionsErrors = {
  positionNotInCompany: (positionId: string, companyId: string) =>
    `Position with id "${positionId}" is not in company with id "${companyId}"`,
  positionNotFound: (id: string) => `Position with id "${id}" not found`,
  positionTitleExists: (title: string) => `Position with title "${title}" already exists`,
};
