import { Op, QueryTypes } from 'sequelize';
import { Category, Product, ProductOption, OptionType } from '../models';
import sequelize from '../db/sequelize';
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
        const rows = await Category.findAll({
          where: { isActive: true },
          order: [['displayOrder', 'ASC']],
        });
        return rows || [];
      } catch (err: any) {
        console.error('[MenuService.getAllCategories Error]:', err.message);
        throw err;
      }
    });
  }

  public async getCategoryById(categoryId: string): Promise<Category | undefined> {
    try {
      const row = await Category.findByPk(categoryId);
      return row || undefined;
    } catch (err: any) {
      console.error('[MenuService.getCategoryById Error]:', err.message);
      throw err;
    }
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
        const whereClause: any = { isAvailable: true };

        if (filters?.categoryId && filters.categoryId !== 'ALL') {
          whereClause.categoryId = filters.categoryId;
        }
        if (filters?.canteenId && filters.canteenId !== 'ALL') {
          whereClause.canteenId = filters.canteenId;
        }
        if (filters?.search) {
          const kw = `%${filters.search.trim()}%`;
          whereClause[Op.or] = [
            { name: { [Op.like]: kw } },
            { description: { [Op.like]: kw } },
          ];
        }
        if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
          whereClause.price = { [Op.between]: [filters.minPrice, filters.maxPrice] };
        } else if (filters?.minPrice !== undefined) {
          whereClause.price = { [Op.gte]: filters.minPrice };
        } else if (filters?.maxPrice !== undefined) {
          whereClause.price = { [Op.lte]: filters.maxPrice };
        }
        if (filters?.isBestSeller) {
          whereClause.isBestSeller = true;
        }
        if (filters?.isVegetarian) {
          whereClause.isVegetarian = true;
        }

        const rows = await Product.findAll({ where: whereClause });
        return rows || [];
      } catch (err: any) {
        console.error('[MenuService.getProducts Error]:', err.message);
        throw err;
      }
    });
  }

  public async getProductById(productId: string): Promise<Product | undefined> {
    return redisService.remember(`product:${productId}`, 300, async () => {
      try {
        const row = await Product.findByPk(productId);
        return row || undefined;
      } catch (err: any) {
        console.error('[MenuService.getProductById Error]:', err.message);
        throw err;
      }
    });
  }

  // Product Options
  public async getProductOptions(productId: string): Promise<ProductOption[]> {
    try {
      const rows: any[] = await sequelize.query(
        'SELECT * FROM product_options WHERE product_id = ?',
        { replacements: [productId], type: QueryTypes.SELECT }
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const options: ProductOption[] = [];
        for (const r of rows) {
          const itemRows: any[] = await sequelize.query(
            'SELECT * FROM product_option_items WHERE option_id = ?',
            { replacements: [r.id], type: QueryTypes.SELECT }
          );
          const items = Array.isArray(itemRows)
            ? itemRows.map((item: any) => ({
                id: item.id,
                name: item.name,
                extraPrice: Number(item.extra_price) || 0,
                isDefault: Boolean(item.is_default),
              }))
            : [];

          const opt = new ProductOption();
          opt.id = r.id;
          opt.productId = r.product_id;
          opt.name = r.name;
          opt.type = r.type as OptionType;
          opt.isRequired = Boolean(r.is_required);
          opt.maxSelect = Number(r.max_select) || 1;
          opt.items = items as any;

          options.push(opt);
        }
        return options;
      }
      return [];
    } catch (err: any) {
      console.error('[MenuService.getProductOptions Error]:', err.message);
      throw err;
    }
  }

  // Admin Product Operations
  public async createProduct(data: any): Promise<Product> {
    try {
      const id = data.id || `prod-${Date.now()}`;

      const newProduct = await Product.create({
        id,
        name: data.name || 'Món mới',
        price: Number(data.price) || 30000,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        categoryId: data.categoryId || 'cat-1',
        canteenId: data.canteenId || 'cant-a',
        canteenName: data.canteenName || 'Căng tin A2',
        image: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
        rating: data.rating || 5.0,
        reviewCount: data.reviewCount || 1,
        preparationTime: Number(data.preparationTime) || 10,
        isAvailable: data.isAvailable !== false,
        description: data.description,
        isBestSeller: Boolean(data.isBestSeller),
        isVegetarian: Boolean(data.isVegetarian),
        isNew: true,
      });

      await redisService.delPrefix('products');
      await redisService.delPrefix('categories');

      return newProduct;
    } catch (err: any) {
      console.error('[MenuService.createProduct Error]:', err.message);
      throw err;
    }
  }

  public async updateProduct(id: string, data: any): Promise<Product | null> {
    try {
      const current = await Product.findByPk(id);
      if (!current) return null;

      const updatePayload: Record<string, any> = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.price !== undefined) updatePayload.price = Number(data.price);
      if (data.originalPrice !== undefined) updatePayload.originalPrice = Number(data.originalPrice);
      if (data.image !== undefined) updatePayload.image = data.image;
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.preparationTime !== undefined) updatePayload.preparationTime = Number(data.preparationTime);
      if (data.isAvailable !== undefined) updatePayload.isAvailable = Boolean(data.isAvailable);
      if (data.isBestSeller !== undefined) updatePayload.isBestSeller = Boolean(data.isBestSeller);
      if (data.isVegetarian !== undefined) updatePayload.isVegetarian = Boolean(data.isVegetarian);

      await Product.update(updatePayload, { where: { id } });

      await redisService.delPrefix('products');
      return this.getProductById(id) as Promise<Product | null>;
    } catch (err: any) {
      console.error('[MenuService.updateProduct Error]:', err.message);
      throw err;
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    try {
      const affectedCount = await Product.destroy({ where: { id } });
      const deleted = affectedCount > 0;
      if (deleted) {
        await redisService.delPrefix('products');
      }
      return deleted;
    } catch (err: any) {
      console.error('[MenuService.deleteProduct Error]:', err.message);
      throw err;
    }
  }
}

export const menuService = new MenuService();
