export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'BANNED';

export interface TokenPayload {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: UserRole;
    studentId?: string;
    faculty?: string;
}

export interface LoginResult {
    user: import('../models').User;
    token: string;
}