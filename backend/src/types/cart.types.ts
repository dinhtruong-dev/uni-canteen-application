export interface RedisCartItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    itemSubtotal: number;
    notes?: string;
    selectedOptions?: any[];
}

export interface RedisCart {
    userId: string;
    items: RedisCartItem[];
    totalItems: number;
    totalAmount: number;
    updatedAt: string;
}

export interface SelectedOptionSnapshot {
    groupId: string;
    groupName?: string;
    optionId?: string;
    itemId?: string;
    optionName?: string;
    price?: number;
    extraPrice?: number;
}