export interface UserVoucherEntity {
    id: string;
    userId: string;
    voucherId: string;
    isUsed: boolean;
    usedAt?: string;
    createdAt: string;
}