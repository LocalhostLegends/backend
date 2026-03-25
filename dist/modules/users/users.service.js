"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const argon2 = __importStar(require("@node-rs/argon2"));
const user_entity_1 = require("../../database/entities/user.entity");
const department_entity_1 = require("../../database/entities/department.entity");
const position_entity_1 = require("../../database/entities/position.entity");
const user_entity_enums_1 = require("../../database/entities/user.entity.enums");
const error_messages_1 = require("../../common/exceptions/error-messages");
let UsersService = class UsersService {
    _usersRepository;
    _departmentRepository;
    _positionRepository;
    constructor(_usersRepository, _departmentRepository, _positionRepository) {
        this._usersRepository = _usersRepository;
        this._departmentRepository = _departmentRepository;
        this._positionRepository = _positionRepository;
    }
    async create(createUserDto) {
        await this._ensureEmailUnique(createUserDto.email);
        const hashedPassword = await argon2.hash(createUserDto.password);
        let department;
        if (createUserDto.departmentId) {
            department = await this._findDepartmentById(createUserDto.departmentId);
        }
        let position;
        if (createUserDto.positionId) {
            position = await this._findPositionById(createUserDto.positionId);
        }
        const createdUser = this._usersRepository.create({
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            password: hashedPassword,
            phone: createUserDto.phone,
            department,
            position,
            role: user_entity_enums_1.UserRole.EMPLOYEE,
        });
        return this._usersRepository.save(createdUser);
    }
    async findAll() {
        return this._usersRepository.find({
            relations: ['department', 'position'],
        });
    }
    async findOne(id, currentUser) {
        if (currentUser.role !== user_entity_enums_1.UserRole.HR && currentUser.id !== id) {
            throw new common_1.ForbiddenException(error_messages_1.ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(user_entity_enums_1.UserRole.HR));
        }
        return this.findById(id);
    }
    async findById(id) {
        const user = await this._usersRepository.findOne({
            where: { id },
            relations: ['department', 'position'],
        });
        if (!user) {
            throw new common_1.NotFoundException(error_messages_1.ErrorMessages.USER_NOT_FOUND(id));
        }
        return user;
    }
    async findByEmail(email) {
        return this._usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.department', 'department')
            .leftJoinAndSelect('user.position', 'position')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne();
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.findOne(id, currentUser);
        if (updateUserDto.email !== undefined && updateUserDto.email !== user.email) {
            await this._ensureEmailUnique(updateUserDto.email);
        }
        const updateData = {};
        if (updateUserDto.firstName !== undefined)
            updateData.firstName = updateUserDto.firstName;
        if (updateUserDto.lastName !== undefined)
            updateData.lastName = updateUserDto.lastName;
        if (updateUserDto.email !== undefined)
            updateData.email = updateUserDto.email;
        if (updateUserDto.phone !== undefined)
            updateData.phone = updateUserDto.phone;
        if (updateUserDto.avatar !== undefined)
            updateData.avatar = updateUserDto.avatar;
        if (currentUser.role === user_entity_enums_1.UserRole.HR) {
            if (updateUserDto.departmentId !== undefined) {
                updateData.department = updateUserDto.departmentId
                    ? await this._findDepartmentById(updateUserDto.departmentId)
                    : undefined;
            }
            if (updateUserDto.positionId !== undefined) {
                updateData.position = updateUserDto.positionId
                    ? await this._findPositionById(updateUserDto.positionId)
                    : undefined;
            }
        }
        const updatedUser = this._usersRepository.merge(user, updateData);
        return this._usersRepository.save(updatedUser);
    }
    async remove(id) {
        const user = await this.findById(id);
        await this._usersRepository.remove(user);
    }
    async _ensureEmailUnique(email) {
        const user = await this._usersRepository.findOne({ where: { email } });
        if (user)
            throw new common_1.ConflictException(error_messages_1.ErrorMessages.USER_EMAIL_EXISTS(email));
    }
    async _findDepartmentById(id) {
        const department = await this._departmentRepository.findOne({ where: { id } });
        if (!department)
            throw new common_1.NotFoundException(error_messages_1.ErrorMessages.DEPARTMENT_NOT_FOUND(id));
        return department;
    }
    async _findPositionById(id) {
        const position = await this._positionRepository.findOne({ where: { id } });
        if (!position)
            throw new common_1.NotFoundException(error_messages_1.ErrorMessages.POSITION_NOT_FOUND(id));
        return position;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map