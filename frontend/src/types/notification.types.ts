export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    dateDisplay?: string;
    read: boolean;
    type: 'ORDER' | 'PROMO' | 'WALLET' | 'SYSTEM';
    linkOrderId?: string;
    actionText?: string;
    bannerImage?: string;
    iconEmoji?: string;
}

export interface WalletTransaction {
    id: string;
    amount: number;
    type: 'TOPUP' | 'PAYMENT' | 'REFUND';
    description: string;
    date: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}