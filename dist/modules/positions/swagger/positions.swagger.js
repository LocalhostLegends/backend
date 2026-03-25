"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerDeletePosition = exports.SwaggerUpdatePosition = exports.SwaggerFindOnePosition = exports.SwaggerFindAllPositions = exports.SwaggerCreatePosition = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const position_schema_1 = require("./position.schema");
const SwaggerCreatePosition = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Create a new position' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Position created successfully', type: position_schema_1.PositionResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Position with this title already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerCreatePosition = SwaggerCreatePosition;
const SwaggerFindAllPositions = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get all positions' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'List of positions', type: [position_schema_1.PositionResponse] }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerFindAllPositions = SwaggerFindAllPositions;
const SwaggerFindOnePosition = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Get position by ID' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Position UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Position found', type: position_schema_1.PositionResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Position not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerFindOnePosition = SwaggerFindOnePosition;
const SwaggerUpdatePosition = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Update position' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Position UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Position updated successfully', type: position_schema_1.PositionResponse }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Position not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Position with this title already exists' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerUpdatePosition = SwaggerUpdatePosition;
const SwaggerDeletePosition = () => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: 'Delete position' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Position UUID', type: String }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Position deleted successfully' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Position not found' }), (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }));
};
exports.SwaggerDeletePosition = SwaggerDeletePosition;
//# sourceMappingURL=positions.swagger.js.map