import { Department } from '@database/entities/department.entity';
export declare class DepartmentResponse implements Partial<Department> {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
