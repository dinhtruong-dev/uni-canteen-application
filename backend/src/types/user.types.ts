export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface UserEntity {
    id: string;
    studentId?: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    faculty?: string;
    department?: string;
    walletBalance: number;
    avatar?: string;
    passwordHash?: string;
    createdAt: string;
    updatedAt: string;
}