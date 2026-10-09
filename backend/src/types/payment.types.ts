export type WalletTransactionType = 'TOPUP' | 'PAYMENT' | 'REFUND';
export type WalletTransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface WalletTransactionItem {
    id: string;
    userId: string;
    amount: number;
    type: WalletTransactionType;
    description: string;
    date: string;
    status: WalletTransactionStatus;
}