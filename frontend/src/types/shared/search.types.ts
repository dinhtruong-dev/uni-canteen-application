// src/types/shared/search.types.ts

import type { FoodItem } from './food.types';

export interface CanteenSearchItem {
    canteen: {
        id: string;
        name: string;
        displayName: string;
        code: string;
        location: string;
        distance: string;
        duration: string;
        rating: number;
        reviewCount: number;
        soldCount: string;
        voucher: string;
        freeship: string;
        image: string;
        isOpen: boolean;
    };
    foods: FoodItem[];
    totalFoodsInCanteen: number;
}

export interface SearchResponse {
    success: boolean;
    query: string;
    page: number;
    limit: number;
    totalPages: number;
    totalCanteens: number;
    totalMatches: number;
    hasMore: boolean;
    data: CanteenSearchItem[];
}

export interface SearchParams {
    q?: string;
    page?: number;
    limit?: number;
    sortBy?: 'popular' | 'rating' | 'price_asc' | 'price_desc';
    promoOnly?: boolean;
    under30k?: boolean;
    categoryId?: string;
}

// Type cho Response của Search History
export type SearchHistoryResponse = {
    success: boolean;
    data: string[];
};