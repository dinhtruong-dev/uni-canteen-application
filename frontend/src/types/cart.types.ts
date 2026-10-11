import type { FoodItem, FoodSize, FoodTopping } from './food.types';

export interface CartItem {
    id: string;
    food: FoodItem;
    quantity: number;
    selectedSize?: FoodSize;
    selectedToppings: FoodTopping[];
    notes?: string;
    unitPrice: number;
}