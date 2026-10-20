export interface WalletTransaction {
    id: string;
    amount: number;
    type: 'TOPUP' | 'PAYMENT' | 'REFUND';
    description: string;
    date: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}