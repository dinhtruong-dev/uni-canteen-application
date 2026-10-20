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
