export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export type OrderType = 'DINE_IN' | 'PICKUP' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'WAITING_PICKUP'
    | 'DELIVERING'
    | 'SERVED'
    | 'COMPLETED'
    | 'CANCELLED';

export type PaymentMethod =
    | 'STUDENT_WALLET'
    | 'CASH'
    | 'VNPAY_QR'
    | 'MOMO'
    | 'E_GREEN'
    | 'APPLE_PAY'
    | 'SHOPEEPAY'
    | 'ZALOPAY'
    | 'CREDIT_CARD';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export type DiningTableStatus = TableStatus | 'EMPTY';
