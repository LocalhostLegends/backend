import { UserRole } from './user.entity.enums';
import { Department } from './department.entity';
import { Position } from './position.entity';
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    email: string;
    password: string;
    department: Department;
    position: Position;
    phone: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}
