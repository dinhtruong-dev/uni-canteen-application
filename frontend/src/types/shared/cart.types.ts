import type { FoodItem, FoodSize, FoodTopping } from './food.types';

export interface CartItem {
    id: string;
    food: FoodItem;
    quantity: number;
    selectedSize?: FoodSize;
    selectedToppings: FoodTopping[];
    notes?: string;
    unitPrice: number;
    foodId?: string;
    foodName?: string;
    foodImage?: string;
    itemSubtotal?: number;
}

export interface SelectedOption {
    name: string;
    price: number;
    type?: string;
    groupId?: string;
    groupName?: string;
    optionId?: string;
}

export interface RedisCartItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    basePrice: number;
    quantity: number;
    selectedOptions?: SelectedOption[];
    notes?: string;
    unitPrice?: number;
    itemTotal?: number;
}

export interface RedisCart {
    id: string;
    userId: string;
    canteenId?: string;
    items: RedisCartItem[];
    totalItems: number;
    totalAmount: number;
    updatedAt: string;
}