"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerRefresh = exports.SwaggerLogin = exports.SwaggerRegister = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_schema_1 = require("./auth.schema");
const user_schema_1 = require("../../users/swagger/user.schema");
const SwaggerRegister = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Register a new user' }), (0, swagger_1.ApiBody)({ type: auth_schema_1.RegisterBodySchema }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'User registered successfully', type: user_schema_1.UserResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'User with this email already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Validation error' }));
};
exports.SwaggerRegister = SwaggerRegister;
const SwaggerLogin = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }), (0, swagger_1.ApiBody)({ type: auth_schema_1.LoginBodySchema }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Login successful, refresh token set in cookie', type: auth_schema_1.AuthResponseSchema }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Validation error' }));
};
exports.SwaggerLogin = SwaggerLogin;
const SwaggerRefresh = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token cookie' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'New access token returned', type: auth_schema_1.AuthResponseSchema }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Invalid or expired refresh token' }));
};
exports.SwaggerRefresh = SwaggerRefresh;
//# sourceMappingURL=auth.swagger.js.map