import type { Product, Canteen } from '../models';

export type SearchSortBy = 'popular' | 'rating' | 'price_asc' | 'price_desc';
export type SearchType = 'all' | 'foods' | 'canteens';

export interface SearchFilterOptions {
    q?: string;
    page?: number;
    limit?: number;
    sortBy?: SearchSortBy | string;
    promoOnly?: boolean;
    under30k?: boolean;
    categoryId?: string;
    type?: SearchType | string;
}

export interface CanteenGroup {
    canteen: Canteen;
    foods: Product[];
    totalFoodsInCanteen: number;
}

export interface SearchResult {
    success: boolean;
    query: string;
    page: number;
    limit: number;
    totalPages: number;
    totalMatches: number;
    totalCanteens: number;
    hasMore: boolean;
    data: CanteenGroup[];
    canteens: Canteen[];
    foodItems: Product[];
}