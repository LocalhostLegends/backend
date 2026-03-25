"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerDeleteUser = exports.SwaggerUpdateUser = exports.SwaggerFindOneUser = exports.SwaggerFindAllUsers = exports.SwaggerCreateUser = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_schema_1 = require("./user.schema");
const SwaggerCreateUser = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Create a new user' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'User created successfully', type: user_schema_1.UserResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'User with this email already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerCreateUser = SwaggerCreateUser;
const SwaggerFindAllUsers = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get all users' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'List of users', type: [user_schema_1.UserResponse] }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerFindAllUsers = SwaggerFindAllUsers;
const SwaggerFindOneUser = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'User UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'User found', type: user_schema_1.UserResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'User not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied' }));
};
exports.SwaggerFindOneUser = SwaggerFindOneUser;
const SwaggerUpdateUser = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Update user' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'User UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'User updated successfully', type: user_schema_1.UserResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'User not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'User with this email already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied' }));
};
exports.SwaggerUpdateUser = SwaggerUpdateUser;
const SwaggerDeleteUser = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Delete user' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'User UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'User deleted successfully' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'User not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerDeleteUser = SwaggerDeleteUser;
//# sourceMappingURL=user.swagger.js.map