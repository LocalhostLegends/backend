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
exports.LoginBodySchema = exports.RegisterBodySchema = exports.AuthResponseSchema = void 0;
const swagger_1 = require("@nestjs/swagger");
class AuthResponseSchema {
    accessToken;
}
exports.AuthResponseSchema = AuthResponseSchema;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' }),
    __metadata("design:type", String)
], AuthResponseSchema.prototype, "accessToken", void 0);
class RegisterBodySchema {
    firstName;
    lastName;
    email;
    password;
}
exports.RegisterBodySchema = RegisterBodySchema;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'First name', maxLength: 100 }),
    __metadata("design:type", String)
], RegisterBodySchema.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'Last name', maxLength: 100 }),
    __metadata("design:type", String)
], RegisterBodySchema.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com', description: 'Email address' }),
    __metadata("design:type", String)
], RegisterBodySchema.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Password (min 6 characters)', minLength: 6 }),
    __metadata("design:type", String)
], RegisterBodySchema.prototype, "password", void 0);
class LoginBodySchema {
    email;
    password;
}
exports.LoginBodySchema = LoginBodySchema;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com', description: 'Email address' }),
    __metadata("design:type", String)
], LoginBodySchema.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Password' }),
    __metadata("design:type", String)
], LoginBodySchema.prototype, "password", void 0);
//# sourceMappingURL=auth.schema.js.map