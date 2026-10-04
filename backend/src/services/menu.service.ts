import { db } from './database.service';
import { Category, Product, ProductOption } from '../models';
import { executeQuery } from '../config/db.config';
import { redisService } from './redis.service';

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
  /**
   * Lấy danh sách danh mục (Categories)
   * Cache-Aside Pattern: Redis Cache -> Miss -> Live MySQL Query -> Lưu Cache
   */
  public async getAllCategories(): Promise<Category[]> {
    return redisService.remember('categories:all', 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC');
        if (Array.isArray(rows) && rows.length > 0) {
          const list: Category[] = [];
          for (const row of rows) {
            const cat = new Category(
              row.id,
              row.name,
              row.icon || 'Utensils',
              row.image || '',
              Number(row.display_order) || 0,
              row.description || undefined,
              Boolean(row.is_active)
            );
            db.categories.set(cat.id, cat);
            list.push(cat);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[MenuService] MySQL fetch categories notice:', err.message);
      }
      return Array.from(db.categories.values())
        .filter((c) => c.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    });
  }

  public async getCategoryById(categoryId: string): Promise<Category | undefined> {
    const categories = await this.getAllCategories();
    return categories.find((c) => c.id === categoryId) || db.categories.get(categoryId);
  }

  /**
   * Lấy danh sách món ăn (Products) theo bộ lọc
   * Cache-Aside Pattern: Redis Cache -> Miss -> Live MySQL Query -> Lưu Cache
   */
  public async getProducts(filters?: ProductFilterQuery): Promise<Product[]> {
    const hasFilter = filters && Object.values(filters).some((v) => v !== undefined && v !== 'ALL');
    const filterKey = hasFilter ? JSON.stringify(filters) : 'all';
    const cacheKey = `products:${Buffer.from(filterKey).toString('base64')}`;

    return redisService.remember(cacheKey, 120, async () => {
      try {
        let sql = 'SELECT * FROM products WHERE is_available = 1';
        const params: any[] = [];

        if (filters?.categoryId && filters.categoryId !== 'ALL') {
          sql += ' AND category_id = ?';
          params.push(filters.categoryId);
        }
        if (filters?.canteenId && filters.canteenId !== 'ALL') {
          sql += ' AND canteen_id = ?';
          params.push(filters.canteenId);
        }
        if (filters?.search) {
          sql += ' AND (name LIKE ? OR description LIKE ?)';
          const kw = `%${filters.search.trim()}%`;
          params.push(kw, kw);
        }
        if (filters?.minPrice !== undefined) {
          sql += ' AND price >= ?';
          params.push(filters.minPrice);
        }
        if (filters?.maxPrice !== undefined) {
          sql += ' AND price <= ?';
          params.push(filters.maxPrice);
        }
        if (filters?.isBestSeller) {
          sql += ' AND is_bestseller = 1';
        }
        if (filters?.isVegetarian) {
          sql += ' AND is_vegetarian = 1';
        }

        const rows = await executeQuery(sql, params);
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map(
            (r: any) =>
              new Product(
                r.id,
                r.name,
                Number(r.price) || 0,
                r.category_id,
                r.canteen_id,
                r.image,
                Number(r.rating) || 5.0,
                Number(r.review_count) || 0,
                Number(r.preparation_time) || 10,
                r.is_available === 1 || r.is_available === true,
                {
                  originalPrice: r.original_price ? Number(r.original_price) : undefined,
                  canteenName: r.canteen_name,
                  description: r.description,
                  isBestSeller: Boolean(r.is_bestseller),
                  isVegetarian: Boolean(r.is_vegetarian),
                  isNew: Boolean(r.is_new),
                }
              )
          );
        }
      } catch (err: any) {
        console.warn('[MenuService] MySQL fetch products notice:', err.message);
      }

      // In-Memory Fallback
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
    });
  }

  public async getProductById(productId: string): Promise<Product | undefined> {
    return redisService.remember(`product:${productId}`, 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM products WHERE id = ?', [productId]);
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          const prod = new Product(
            r.id,
            r.name,
            Number(r.price) || 0,
            r.category_id,
            r.canteen_id,
            r.image,
            Number(r.rating) || 5.0,
            Number(r.review_count) || 0,
            Number(r.preparation_time) || 10,
            r.is_available === 1 || r.is_available === true,
            {
              originalPrice: r.original_price ? Number(r.original_price) : undefined,
              canteenName: r.canteen_name,
              description: r.description,
              isBestSeller: Boolean(r.is_bestseller),
              isVegetarian: Boolean(r.is_vegetarian),
              isNew: Boolean(r.is_new),
            }
          );
          db.products.set(prod.id, prod);
          return prod;
        }
      } catch (err: any) {
        console.warn('[MenuService] MySQL getProductById notice:', err.message);
      }
      return db.products.get(productId);
    });
  }

  // Product Options
  public getProductOptions(productId: string): ProductOption[] {
    return Array.from(db.productOptions.values()).filter((opt) => opt.productId === productId);
  }

  // Admin Product Operations
  public async createProduct(data: any): Promise<Product> {
    const id = data.id || `prod-${Date.now()}`;
    const newProduct = new Product(
      id,
      data.name || 'Món mới',
      Number(data.price) || 30000,
      data.categoryId || 'cat-1',
      data.canteenId || 'cant-a',
      data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      data.rating || 5.0,
      data.reviewCount || 1,
      Number(data.preparationTime) || 10,
      data.isAvailable !== false,
      {
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        categoryName: data.categoryName,
        canteenName: data.canteenName,
        description: data.description,
        isBestSeller: Boolean(data.isBestSeller),
        isVegetarian: Boolean(data.isVegetarian),
        isNew: true,
      }
    );

    db.products.set(newProduct.id, newProduct);

    // Persist to MySQL
    try {
      await executeQuery(
        `INSERT INTO products (
          id, category_id, canteen_id, canteen_name, name, price, original_price, image,
          description, preparation_time, is_available, is_bestseller, is_new, is_vegetarian
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), is_available = VALUES(is_available)`,
        [
          newProduct.id,
          newProduct.categoryId,
          newProduct.canteenId,
          newProduct.canteenName || 'Căng tin A2',
          newProduct.name,
          newProduct.price,
          newProduct.originalPrice || null,
          newProduct.image,
          newProduct.description || null,
          newProduct.preparationTime,
          newProduct.isAvailable ? 1 : 0,
          newProduct.isBestSeller ? 1 : 0,
          newProduct.isNew ? 1 : 0,
          newProduct.isVegetarian ? 1 : 0,
        ]
      );
    } catch (dbErr: any) {
      console.warn('[MySQL Product Create Notice]:', dbErr.message);
    }

    // Invalidate Cache for Redis & In-Memory Fallback
    await redisService.delPrefix('products');
    await redisService.delPrefix('categories');

    return newProduct;
  }

  public async updateProduct(id: string, data: any): Promise<Product | null> {
    const prod = db.products.get(id);
    if (!prod) return null;

    if (data.name !== undefined) prod.name = data.name;
    if (data.price !== undefined) prod.price = Number(data.price);
    if (data.originalPrice !== undefined) prod.originalPrice = Number(data.originalPrice);
    if (data.categoryId !== undefined) prod.categoryId = data.categoryId;
    if (data.categoryName !== undefined) prod.categoryName = data.categoryName;
    if (data.canteenId !== undefined) prod.canteenId = data.canteenId;
    if (data.canteenName !== undefined) prod.canteenName = data.canteenName;
    if (data.image !== undefined) prod.image = data.image;
    if (data.description !== undefined) prod.description = data.description;
    if (data.preparationTime !== undefined) prod.preparationTime = Number(data.preparationTime);
    if (data.isAvailable !== undefined) prod.isAvailable = Boolean(data.isAvailable);
    if (data.isBestSeller !== undefined) prod.isBestSeller = Boolean(data.isBestSeller);
    if (data.isVegetarian !== undefined) prod.isVegetarian = Boolean(data.isVegetarian);

    // Persist update to MySQL
    try {
      await executeQuery(
        `UPDATE products SET
          name = ?, price = ?, original_price = ?, image = ?, description = ?,
          preparation_time = ?, is_available = ?, is_bestseller = ?, is_vegetarian = ?
        WHERE id = ?`,
        [
          prod.name,
          prod.price,
          prod.originalPrice || null,
          prod.image,
          prod.description || null,
          prod.preparationTime,
          prod.isAvailable ? 1 : 0,
          prod.isBestSeller ? 1 : 0,
          prod.isVegetarian ? 1 : 0,
          prod.id,
        ]
      );
    } catch (e: any) {
      console.warn('[MySQL Product Update Notice]:', e.message);
    }

    // Invalidate Cache
    await redisService.delPrefix('products');

    return prod;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const exists = db.products.has(id);
    if (!exists) return false;

    db.products.delete(id);

    try {
      await executeQuery('DELETE FROM products WHERE id = ?', [id]);
    } catch (e: any) {
      console.warn('[MySQL Product Delete Notice]:', e.message);
    }

    // Invalidate Cache
    await redisService.delPrefix('products');

    return true;
  }
}

export const menuService = new MenuService();
