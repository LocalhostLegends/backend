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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const argon2 = __importStar(require("@node-rs/argon2"));
const user_entity_1 = require("../entities/user.entity");
const department_entity_1 = require("../entities/department.entity");
const position_entity_1 = require("../entities/position.entity");
const departments_data_1 = require("./data/departments.data");
const positions_data_1 = require("./data/positions.data");
const users_data_1 = require("./data/users.data");
let SeedService = SeedService_1 = class SeedService {
    _userRepository;
    _departmentRepository;
    _positionRepository;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(_userRepository, _departmentRepository, _positionRepository) {
        this._userRepository = _userRepository;
        this._departmentRepository = _departmentRepository;
        this._positionRepository = _positionRepository;
    }
    async onModuleInit() {
        await this.seed().catch(err => {
            this.logger.error('Seeding failed:', err);
        });
    }
    async seed() {
        const departmentCount = await this._departmentRepository.count();
        if (departmentCount > 0) {
            this.logger.log('Database already seeded');
            return;
        }
        this.logger.log('Starting seeding...');
        try {
            const departments = await this._departmentRepository.save(departments_data_1.departmentsData.map(d => this._departmentRepository.create(d)));
            this.logger.log(`✓ ${departments.length} departments created`);
            const positions = await this._positionRepository.save(positions_data_1.positionsData.map(p => this._positionRepository.create(p)));
            this.logger.log(`✓ ${positions.length} positions created`);
            const hashedPassword = await argon2.hash('123456');
            await this._userRepository.save(users_data_1.usersData.map(u => this._userRepository.create({
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                department: departments[u.departmentIndex],
                position: positions[u.positionIndex],
            })));
            this.logger.log('✓ 2 HR and 3 employees created');
            this.logger.log('✓ Seeding completed!');
        }
        catch (error) {
            this.logger.error('Seeding failed', error);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map