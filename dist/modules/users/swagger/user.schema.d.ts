import { User } from '@database/entities/user.entity';
import { UserRole } from '@database/entities/user.entity.enums';
export declare class UserResponse implements Partial<User> {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    phone: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}
