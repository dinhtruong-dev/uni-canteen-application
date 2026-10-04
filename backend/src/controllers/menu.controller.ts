import { Request, Response } from 'express';
import { menuService } from '../services/menu.service';
import { db } from '../services/database.service';
import { executeQuery } from '../config/db.config';
import { redisService } from '../services/redis.service';

export class MenuController {
  public async getCategories(_req: Request, res: Response) {
    try {
      const categories = (await menuService.getAllCategories()).map((c: any) =>
        typeof c?.toJSON === 'function' ? c.toJSON() : c
      );
      res.json({ success: true, data: categories });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh mục', error: err.message });
    }
  }

  public async getProducts(req: Request, res: Response) {
    try {
      const { categoryId, canteenId, search, minPrice, maxPrice, isBestSeller, isVegetarian } = req.query;

      const rawProducts = await menuService.getProducts({
        categoryId: categoryId as string,
        canteenId: canteenId as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isBestSeller: isBestSeller === 'true',
        isVegetarian: isVegetarian === 'true',
      });
      const products = rawProducts.map((p: any) => (typeof p?.toJSON === 'function' ? p.toJSON() : p));

      res.json({ success: true, total: products.length, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách món ăn', error: err.message });
    }
  }

  public async getProductDetail(req: Request, res: Response) {
    try {
      const product = await menuService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      const options = menuService
        .getProductOptions(product.id)
        .map((opt: any) => (typeof opt?.toJSON === 'function' ? opt.toJSON() : opt));
      const productData = typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product;
      res.json({
        success: true,
        data: {
          ...productData,
          options,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải chi tiết món ăn', error: err.message });
    }
  }

  public async toggleAvailability(req: Request, res: Response) {
    try {
      const product = db.products.get(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      if (typeof req.body.isAvailable === 'boolean') {
        product.isAvailable = req.body.isAvailable;
      } else {
        product.isAvailable = !product.isAvailable;
      }

      // Persist to MySQL
      try {
        await executeQuery('UPDATE products SET is_available = ? WHERE id = ?', [
          product.isAvailable ? 1 : 0,
          product.id,
        ]);
      } catch (dbErr: any) {
        console.warn('[MySQL Product Availability Notice]:', dbErr.message);
      }

      // Invalidate Cache
      await redisService.delPrefix('products');

      return res.json({
        success: true,
        message: `Đã cập nhật món "${product.name}": ${product.isAvailable ? 'Còn món' : 'Đã báo hết món'}`,
        data: typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái món', error: err.message });
    }
  }

  public async createProduct(req: Request, res: Response) {
    try {
      const { name, price } = req.body;
      if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và giá món ăn' });
      }
      const product = await menuService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: `Đã thêm món "${product.name}" thành công!`,
        data: typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Lỗi thêm món ăn' });
    }
  }

  public async updateProduct(req: Request, res: Response) {
    try {
      const product = await menuService.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn để cập nhật' });
      }
      res.json({
        success: true,
        message: `Đã cập nhật món "${product.name}" thành công!`,
        data: typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Lỗi cập nhật món ăn' });
    }
  }

  public async deleteProduct(req: Request, res: Response) {
    try {
      const ok = await menuService.deleteProduct(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn để xóa' });
      }
      res.json({ success: true, message: 'Đã xóa món ăn thành công khỏi thực đơn' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Lỗi xóa món ăn' });
    }
  }
}

export const menuController = new MenuController();
