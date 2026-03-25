import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<import("../../database/entities/department.entity").Department>;
    findAll(): Promise<import("../../database/entities/department.entity").Department[]>;
    findOne(id: string): Promise<import("../../database/entities/department.entity").Department>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<import("../../database/entities/department.entity").Department>;
    remove(id: string): Promise<void>;
}
