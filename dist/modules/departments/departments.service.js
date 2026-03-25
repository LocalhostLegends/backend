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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("../../database/entities/department.entity");
const error_messages_1 = require("../../common/exceptions/error-messages");
let DepartmentsService = class DepartmentsService {
    departmentsRepository;
    constructor(departmentsRepository) {
        this.departmentsRepository = departmentsRepository;
    }
    async create(createDepartmentDto) {
        const existing = await this.departmentsRepository.findOne({
            where: { name: createDepartmentDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(error_messages_1.ErrorMessages.DEPARTMENT_NAME_EXISTS(createDepartmentDto.name));
        }
        const department = this.departmentsRepository.create(createDepartmentDto);
        return this.departmentsRepository.save(department);
    }
    async findAll() {
        return this.departmentsRepository.find();
    }
    async findOne(id) {
        const department = await this.departmentsRepository.findOne({ where: { id } });
        if (!department)
            throw new common_1.NotFoundException(error_messages_1.ErrorMessages.DEPARTMENT_NOT_FOUND(id));
        return department;
    }
    async update(id, updateDepartmentDto) {
        const department = await this.findOne(id);
        if (updateDepartmentDto.name) {
            const existing = await this.departmentsRepository.findOne({
                where: { name: updateDepartmentDto.name },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(error_messages_1.ErrorMessages.DEPARTMENT_NAME_EXISTS(updateDepartmentDto.name));
            }
        }
        Object.assign(department, updateDepartmentDto);
        return this.departmentsRepository.save(department);
    }
    async remove(id) {
        const department = await this.findOne(id);
        await this.departmentsRepository.remove(department);
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map