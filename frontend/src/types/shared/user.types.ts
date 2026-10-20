import type { Role } from '../enums.types';

export interface DeliveryAddress {
    id?: string;
    label?: string;
    campus?: string;
    area?: string;
    building: string;
    floor?: string;
    room: string;
    phone?: string;
    notes?: string;
    note?: string;
    isDefault?: boolean;
}

export interface User {
    id: string;
    name: string;
    studentId?: string;
    email: string;
    phone: string;
    role: Role;
    faculty?: string;
    department?: string;
    className?: string;
    gender?: string;
    dateOfBirth?: string;
    avatar: string;
    isEmailVerified?: boolean;
    walletBalance: number;
    savedAddresses: DeliveryAddress[];
    canteenId?: string;
    status?: 'ACTIVE' | 'BLOCKED';
    createdAt: string;
}

export interface CampusLocationNode {
    id: string;
    name: string;
    children?: CampusLocationNode[];
}