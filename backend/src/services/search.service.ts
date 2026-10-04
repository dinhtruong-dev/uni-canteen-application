import { db } from './database.service';
import { SearchHistoryItem } from '../models';

export interface SearchFilterOptions {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  promoOnly?: boolean;
  under30k?: boolean;
  categoryId?: string;
  type?: string;
}

export class SearchService {
  public async executeSearch(options: SearchFilterOptions) {
    const q = (options.q || '').trim().toLowerCase();
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 3);
    const sortBy = options.sortBy || 'popular';
    const promoOnly = Boolean(options.promoOnly);
    const under30k = Boolean(options.under30k);
    const categoryId = options.categoryId;
    const type = (options.type || 'all').toLowerCase();

    // Automatically record search query in history if meaningful
    if (q && q.length >= 2) {
      this.addHistory(options.q || q, 'user-guest').catch(() => {});
    }

    // 1. Fetch available products dynamically from DatabaseService
    let matchingProducts = Array.from(db.products.values()).filter((p) => p.isAvailable);

    // 2. Fetch canteens dynamically from DatabaseService
    let matchingCanteens = Array.from(db.canteens.values());

    // 3. Filter by search query `q`
    if (q) {
      matchingProducts = matchingProducts.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchCanteen = p.canteenName?.toLowerCase().includes(q);
        const matchCat = p.categoryName?.toLowerCase().includes(q);
        return matchName || matchDesc || matchCanteen || matchCat;
      });

      matchingCanteens = matchingCanteens.filter((c) => {
        const matchName = c.name?.toLowerCase().includes(q);
        const matchDisp = c.displayName?.toLowerCase().includes(q);
        const matchLoc = c.location?.toLowerCase().includes(q);
        const matchCode = c.code?.toLowerCase().includes(q);
        return matchName || matchDisp || matchLoc || matchCode;
      });
    }

    // 4. Quick filter tags
    if (promoOnly) {
      matchingProducts = matchingProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }
    if (under30k) {
      matchingProducts = matchingProducts.filter((p) => p.price <= 30000);
    }
    if (categoryId && categoryId !== 'ALL') {
      matchingProducts = matchingProducts.filter((p) => p.categoryId === categoryId);
    }

    // 5. Dynamic Sorting
    if (sortBy === 'rating') {
      matchingProducts.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      matchingProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      matchingProducts.sort((a, b) => b.price - a.price);
    } else {
      matchingProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    // 6. Group matching products by Canteen (dynamic multi-canteen grouping)
    const allCanteensList = Array.from(db.canteens.values());
    const groupedCanteens: any[] = [];

    for (const canteen of allCanteensList) {
      const foodsInThisCanteen = matchingProducts
        .filter((p) => p.canteenId === canteen.id)
        .map((p: any) => (typeof p?.toJSON === 'function' ? p.toJSON() : p));

      const totalFoodsInCanteen = Array.from(db.products.values()).filter(
        (p) => p.canteenId === canteen.id
      ).length;

      const canteenMatchedDirectly = matchingCanteens.some((c) => c.id === canteen.id);

      if (!q || foodsInThisCanteen.length > 0 || canteenMatchedDirectly) {
        groupedCanteens.push({
          canteen: typeof (canteen as any)?.toJSON === 'function' ? (canteen as any).toJSON() : canteen,
          foods: foodsInThisCanteen,
          totalFoodsInCanteen,
        });
      }
    }

    // Sort canteens: prioritize canteens with matching items and higher rating
    groupedCanteens.sort((a, b) => {
      if (b.foods.length !== a.foods.length) {
        return b.foods.length - a.foods.length;
      }
      return (b.canteen?.rating || 0) - (a.canteen?.rating || 0);
    });

    // 7. Server-side pagination
    const totalCanteens = groupedCanteens.length;
    const totalPages = Math.max(1, Math.ceil(totalCanteens / limit));
    const startIndex = (page - 1) * limit;
    const paginatedGrouped = groupedCanteens.slice(startIndex, startIndex + limit);

    // Flat paginated foods for items-specific queries
    const foodLimit = limit > 3 ? limit : 10;
    const foodTotalPages = Math.max(1, Math.ceil(matchingProducts.length / foodLimit));
    const paginatedFoodItems = matchingProducts
      .slice((page - 1) * foodLimit, page * foodLimit)
      .map((p: any) => (typeof p?.toJSON === 'function' ? p.toJSON() : p));

    // Small delay simulating network search
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      query: q,
      page,
      limit,
      totalPages: type === 'foods' ? foodTotalPages : totalPages,
      totalMatches: matchingProducts.length,
      totalCanteens,
      hasMore: page < totalPages,
      data: paginatedGrouped,
      canteens: matchingCanteens.map((c: any) => (typeof c?.toJSON === 'function' ? c.toJSON() : c)),
      foodItems: paginatedFoodItems,
    };
  }

  public async getHistory(userId: string = 'user-guest'): Promise<string[]> {
    const items = Array.from(db.searchHistories.values())
      .filter((item) => item.userId === userId || item.userId === 'user-guest')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const uniqueQueries: string[] = [];
    for (const item of items) {
      if (!uniqueQueries.some((q) => q.toLowerCase() === item.query.toLowerCase())) {
        uniqueQueries.push(item.query);
      }
    }
    return uniqueQueries.slice(0, 10);
  }

  public async addHistory(query: string, userId: string = 'user-guest'): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) return this.getHistory(userId);

    // Remove existing item with same query to bump to top
    for (const [id, item] of db.searchHistories.entries()) {
      if (item.query.toLowerCase() === trimmed.toLowerCase() && (item.userId === userId || item.userId === 'user-guest')) {
        db.searchHistories.delete(id);
      }
    }

    const newItem = new SearchHistoryItem(
      `sh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      trimmed,
      userId,
      new Date().toISOString()
    );
    db.searchHistories.set(newItem.id, newItem);

    return this.getHistory(userId);
  }

  public async removeHistory(query: string, userId: string = 'user-guest'): Promise<string[]> {
    const trimmed = query.trim().toLowerCase();
    for (const [id, item] of db.searchHistories.entries()) {
      if (item.query.toLowerCase() === trimmed && (item.userId === userId || item.userId === 'user-guest')) {
        db.searchHistories.delete(id);
      }
    }
    return this.getHistory(userId);
  }

  public async clearHistory(userId: string = 'user-guest'): Promise<boolean> {
    for (const [id, item] of db.searchHistories.entries()) {
      if (item.userId === userId || item.userId === 'user-guest') {
        db.searchHistories.delete(id);
      }
    }
    return true;
  }
}

export const searchService = new SearchService();
