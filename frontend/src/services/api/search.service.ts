import { apiClient } from './apiClient';
import { FoodItem } from '../../types';
import { adaptProductToFood } from './menu.service';

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

export class SearchService {
  public async search(params: SearchParams): Promise<SearchResponse> {
    const queryParams: Record<string, any> = {
      q: params.q || '',
      page: params.page || 1,
      limit: params.limit || 3,
      sortBy: params.sortBy || 'popular',
    };

    if (params.promoOnly) queryParams.promoOnly = 'true';
    if (params.under30k) queryParams.under30k = 'true';
    if (params.categoryId) queryParams.categoryId = params.categoryId;

    const res = await apiClient.get<any>('/search', queryParams);

    if (res && res.success && Array.isArray(res.data)) {
      return {
        success: true,
        query: res.query || '',
        page: Number(res.page) || 1,
        limit: Number(res.limit) || 3,
        totalPages: Number(res.totalPages) || 1,
        totalCanteens: Number(res.totalCanteens) || 0,
        totalMatches: Number(res.totalMatches) || 0,
        hasMore: Boolean(res.hasMore),
        data: res.data.map((item: any) => ({
          canteen: item.canteen,
          foods: (item.foods || []).map(adaptProductToFood),
          totalFoodsInCanteen: item.totalFoodsInCanteen || 0,
        })),
      };
    }

    return {
      success: false,
      query: params.q || '',
      page: 1,
      limit: 3,
      totalPages: 1,
      totalCanteens: 0,
      totalMatches: 0,
      hasMore: false,
      data: [],
    };
  }

  /**
   * Fetch dynamic search history from backend API
   */
  public async getSearchHistory(userId: string = 'user-guest'): Promise<string[]> {
    try {
      const res = await apiClient.get<any>('/search/history', { userId });
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Could not fetch search history from backend:', err);
    }
    return [];
  }

  /**
   * Add a search query to backend history
   */
  public async addSearchHistory(query: string, userId: string = 'user-guest'): Promise<string[]> {
    try {
      const res = await apiClient.post<any>('/search/history', { query, userId });
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Could not add search query to backend history:', err);
    }
    return [];
  }

  /**
   * Remove a single search query from backend history
   */
  public async removeSearchHistory(query: string, userId: string = 'user-guest'): Promise<string[]> {
    try {
      const encoded = encodeURIComponent(query);
      const res = await apiClient.delete<any>(`/search/history/${encoded}`);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Could not remove search query from backend history:', err);
    }
    return [];
  }

  /**
   * Clear all search history from backend
   */
  public async clearSearchHistory(userId: string = 'user-guest'): Promise<boolean> {
    try {
      const res = await apiClient.delete<any>('/search/history', { userId });
      return Boolean(res && res.success);
    } catch (err) {
      console.warn('Could not clear search history from backend:', err);
      return false;
    }
  }
}

export const searchService = new SearchService();
