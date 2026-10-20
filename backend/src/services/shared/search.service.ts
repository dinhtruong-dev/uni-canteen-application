// src/services/shared/search.service.ts
import { Op } from 'sequelize';
import sequelize from '../../db/sequelize';
import { Product, Canteen, SearchHistoryItem } from '../../models';
import type {
  SearchFilterOptions,
  SearchResult,
  CanteenGroup,
} from '../../types/search.types';

export class SearchService {
  // ---------------------------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------------------------

  public async executeSearch(options: SearchFilterOptions): Promise<SearchResult> {
    try {
      const q = (options.q || '').trim().toLowerCase();
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, options.limit || 3);
      const sortBy = options.sortBy || 'popular';
      const promoOnly = Boolean(options.promoOnly);
      const under30k = Boolean(options.under30k);
      const categoryId = options.categoryId;
      const type = (options.type || 'all').toLowerCase();

      if (q && q.length >= 2) {
        this.addHistory(options.q || q, 'user-guest').catch(() => { });
      }

      // ---- Product filter ----
      const productWhere: any = { isAvailable: true };

      if (q) {
        productWhere[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { canteenName: { [Op.like]: `%${q}%` } },
        ];
      }
      if (promoOnly) {
        productWhere.originalPrice = { [Op.gt]: sequelize.col('price') };
      }
      if (under30k) {
        productWhere.price = { [Op.lte]: 30000 };
      }
      if (categoryId && categoryId !== 'ALL') {
        productWhere.categoryId = categoryId;
      }

      let order: any = [['soldCount', 'DESC']];
      if (sortBy === 'rating') order = [['rating', 'DESC']];
      else if (sortBy === 'price_asc') order = [['price', 'ASC']];
      else if (sortBy === 'price_desc') order = [['price', 'DESC']];

      const matchingProducts = await Product.findAll({
        where: productWhere,
        order,
      });

      // ---- Canteen filter ----
      const canteenWhere: any = {};
      if (q) {
        canteenWhere[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { displayName: { [Op.like]: `%${q}%` } },
          { location: { [Op.like]: `%${q}%` } },
          { code: { [Op.like]: `%${q}%` } },
        ];
      }
      const matchingCanteens = await Canteen.findAll({ where: canteenWhere });
      const allCanteensList = await Canteen.findAll({ order: [['name', 'ASC']] });

      // ---- Group product theo canteen ----
      const groupedCanteens: CanteenGroup[] = [];

      for (const canteen of allCanteensList) {
        const foodsInThisCanteen = matchingProducts.filter(
          (p: any) => p.canteenId === canteen.id || p.canteen_id === canteen.id
        );
        const canteenMatchedDirectly = matchingCanteens.some((c: any) => c.id === canteen.id);

        if (!q || foodsInThisCanteen.length > 0 || canteenMatchedDirectly) {
          groupedCanteens.push({
            canteen,
            foods: foodsInThisCanteen,
            totalFoodsInCanteen: foodsInThisCanteen.length,
          });
        }
      }

      // Sort: nhiều món trước, rồi tới rating
      groupedCanteens.sort((a, b) => {
        if (b.foods.length !== a.foods.length) return b.foods.length - a.foods.length;
        return (Number(b.canteen?.rating) || 0) - (Number(a.canteen?.rating) || 0);
      });

      // ---- Phân trang ----
      const totalCanteens = groupedCanteens.length;
      const totalPages = Math.max(1, Math.ceil(totalCanteens / limit));
      const startIndex = (page - 1) * limit;
      const paginatedGrouped = groupedCanteens.slice(startIndex, startIndex + limit);

      const foodLimit = limit > 3 ? limit : 10;
      const foodTotalPages = Math.max(1, Math.ceil(matchingProducts.length / foodLimit));
      const paginatedFoodItems = matchingProducts.slice(
        (page - 1) * foodLimit,
        page * foodLimit
      );

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
        canteens: matchingCanteens,
        foodItems: paginatedFoodItems,
      };
    } catch (err: any) {
      console.error('[SearchService.executeSearch Error]:', err.message);
      throw err;
    }
  }

  public async getHistory(userId: string = 'user-guest'): Promise<string[]> {
    try {
      const rows = await SearchHistoryItem.findAll({
        where: {
          [Op.or]: [{ userId }, { userId: 'user-guest' }],
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      if (Array.isArray(rows) && rows.length > 0) {
        return Array.from(new Set(rows.map((r) => r.query)));
      }
      return [];
    } catch (err: any) {
      console.error('[SearchService.getHistory Error]:', err.message);
      return [];
    }
  }

  public async addHistory(
    query: string,
    userId: string = 'user-guest'
  ): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) return this.getHistory(userId);

    try {
      await SearchHistoryItem.destroy({
        where: {
          query: trimmed,
          [Op.or]: [{ userId }, { userId: 'user-guest' }],
        },
      });

      const id = `sh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await SearchHistoryItem.create({ id, query: trimmed, userId });

      return this.getHistory(userId);
    } catch (err: any) {
      console.error('[SearchService.addHistory Error]:', err.message);
      return this.getHistory(userId);
    }
  }

  public async removeHistory(
    query: string,
    userId: string = 'user-guest'
  ): Promise<string[]> {
    try {
      await SearchHistoryItem.destroy({
        where: {
          query: query.trim(),
          [Op.or]: [{ userId }, { userId: 'user-guest' }],
        },
      });
      return this.getHistory(userId);
    } catch (err: any) {
      console.error('[SearchService.removeHistory Error]:', err.message);
      return this.getHistory(userId);
    }
  }

  public async clearHistory(userId: string = 'user-guest'): Promise<boolean> {
    try {
      await SearchHistoryItem.destroy({
        where: {
          [Op.or]: [{ userId }, { userId: 'user-guest' }],
        },
      });
      return true;
    } catch (err: any) {
      console.error('[SearchService.clearHistory Error]:', err.message);
      return false;
    }
  }
}

export const searchService = new SearchService();
