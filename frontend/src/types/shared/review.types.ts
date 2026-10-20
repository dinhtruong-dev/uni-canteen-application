export interface Review {
    id: string;
    userId: string;
    userName: string;
    userRole?: string;
    userAvatar?: string;
    targetType?: 'PRODUCT' | 'CANTEEN';
    targetId?: string;
    targetName?: string;
    productName?: string;
    foodId?: string;
    orderId?: string;
    rating: number;
    comment: string;
    verifiedPurchase?: boolean;
    helpfulCount?: number;
    status?: 'VISIBLE' | 'HIDDEN';
    replyText?: string;
    reply?: string;
    repliedAt?: string;
    date?: string;
    createdAt?: string;
}

export type StaffReview = Review;

export interface ReviewComment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
    reply?: string;
    repliedAt?: string;
    helpfulCount?: number;
}
