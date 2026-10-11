export interface FoodTopping {
    id: string;
    name: string;
    price: number;
}

export interface FoodSize {
    name: string;
    price: number;
}

export interface FoodItem {
    id: string;
    name: string;
    canteenId?: string;
    canteenName?: string;
    categoryId?: string;
    categoryName?: string;
    price: number;
    originalPrice?: number;
    image: string;
    description?: string;
    ingredients?: string[];
    isBestSeller?: boolean;
    isNew?: boolean;
    isVegetarian?: boolean;
    isAvailable: boolean;
    rating: number;
    reviewCount: number;
    soldCount?: number;
    orderCount?: number;
    toppings?: FoodTopping[];
    sizes?: FoodSize[];
    preparationTime: number;
}