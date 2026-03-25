"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class PositionResponse {
    id;
    title;
    description;
    createdAt;
    updatedAt;
}
exports.PositionResponse = PositionResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique identifier' }),
    __metadata("design:type", String)
], PositionResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Developer', description: 'Position title', maxLength: 100 }),
    __metadata("design:type", String)
], PositionResponse.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior software developer position', description: 'Position description', required: false }),
    __metadata("design:type", String)
], PositionResponse.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], PositionResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], PositionResponse.prototype, "updatedAt", void 0);
//# sourceMappingURL=position.schema.js.map