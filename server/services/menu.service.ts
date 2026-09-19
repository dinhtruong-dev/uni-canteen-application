import { db } from './database.service';
import { Category, Product, ProductOption } from '../models';

export interface ProductFilterQuery {
  categoryId?: string;
  canteenId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isBestSeller?: boolean;
  isVegetarian?: boolean;
}

export class MenuService {
  // Categories
  public getAllCategories(): Category[] {
    return Array.from(db.categories.values())
      .filter((c) => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategoryById(categoryId: string): Category | undefined {
    return db.categories.get(categoryId);
  }

  // Products
  public getProducts(filters?: ProductFilterQuery): Product[] {
    let list = Array.from(db.products.values()).filter((p) => p.isAvailable);

    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters?.canteenId && filters.canteenId !== 'ALL') {
      list = list.filter((p) => p.canteenId === filters.canteenId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }
    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters?.isBestSeller) {
      list = list.filter((p) => p.isBestSeller);
    }
    if (filters?.isVegetarian) {
      list = list.filter((p) => p.isVegetarian);
    }

    return list;
  }

  public getProductById(productId: string): Product | undefined {
    return db.products.get(productId);
  }

  // Product Options
  public getProductOptions(productId: string): ProductOption[] {
    return Array.from(db.productOptions.values()).filter((opt) => opt.productId === productId);
  }
}

export const menuService = new MenuService();
