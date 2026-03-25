"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerDeleteDepartment = exports.SwaggerUpdateDepartment = exports.SwaggerFindOneDepartment = exports.SwaggerFindAllDepartments = exports.SwaggerCreateDepartment = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const department_schema_1 = require("./department.schema");
const SwaggerCreateDepartment = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Create a new department' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Department created successfully', type: department_schema_1.DepartmentResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Department with this name already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerCreateDepartment = SwaggerCreateDepartment;
const SwaggerFindAllDepartments = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get all departments' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'List of departments', type: [department_schema_1.DepartmentResponse] }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerFindAllDepartments = SwaggerFindAllDepartments;
const SwaggerFindOneDepartment = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get department by ID' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Department UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Department found', type: department_schema_1.DepartmentResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Department not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerFindOneDepartment = SwaggerFindOneDepartment;
const SwaggerUpdateDepartment = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Update department' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Department UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Department updated successfully', type: department_schema_1.DepartmentResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Department not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Department with this name already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerUpdateDepartment = SwaggerUpdateDepartment;
const SwaggerDeleteDepartment = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Delete department' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Department UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Department deleted successfully' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Department not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerDeleteDepartment = SwaggerDeleteDepartment;
//# sourceMappingURL=departments.swagger.js.map