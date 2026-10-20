import { Request, Response } from 'express';
import { menuService } from '../../services/shared/menu.service';
import { Product } from '../../models';
import { redisService } from '../../services/infrastructure/redis.service';

export class MenuController {
  public async getCategories(_req: Request, res: Response) {
    try {
      const categories = (await menuService.getAllCategories()).map((c: any) =>
        typeof c?.toJSON === 'function' ? c.toJSON() : c
      );
      return res.json({ success: true, data: categories });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải danh mục', error: err.message });
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

      return res.json({ success: true, total: products.length, data: products });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách món ăn', error: err.message });
    }
  }

  public async getProductDetail(req: Request, res: Response) {
    try {
      const product = await menuService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      const optList = await menuService.getProductOptions(product.id);
      const options = optList.map((opt: any) => (typeof opt?.toJSON === 'function' ? opt.toJSON() : opt));
      const productData = typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product;
      return res.json({
        success: true,
        data: {
          ...productData,
          options,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết món ăn', error: err.message });
    }
  }

  public async toggleAvailability(req: Request, res: Response) {
    try {
      const product = await menuService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      const newAvailability = typeof req.body.isAvailable === 'boolean' ? req.body.isAvailable : !product.isAvailable;

      await Product.update(
        { isAvailable: newAvailability },
        { where: { id: product.id } }
      );

      await redisService.delPrefix('products');

      const updated = await menuService.getProductById(req.params.id);

      return res.json({
        success: true,
        message: `Đã cập nhật món "${product.name}": ${newAvailability ? 'Còn món' : 'Đã báo hết món'}`,
        data: updated ? (typeof (updated as any)?.toJSON === 'function' ? (updated as any).toJSON() : updated) : product,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái món', error: err.message });
    }
  }

  public async createProduct(req: Request, res: Response) {
    try {
      const { name, price } = req.body;
      if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và giá món ăn' });
      }
      const product = await menuService.createProduct(req.body);
      return res.status(201).json({
        success: true,
        message: `Đã thêm món "${product.name}" thành công!`,
        data: typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Lỗi thêm món ăn' });
    }
  }

  public async updateProduct(req: Request, res: Response) {
    try {
      const product = await menuService.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn để cập nhật' });
      }
      return res.json({
        success: true,
        message: `Đã cập nhật món "${product.name}" thành công!`,
        data: typeof (product as any)?.toJSON === 'function' ? (product as any).toJSON() : product,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Lỗi cập nhật món ăn' });
    }
  }

  public async deleteProduct(req: Request, res: Response) {
    try {
      const ok = await menuService.deleteProduct(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn để xóa' });
      }
      return res.json({ success: true, message: 'Đã xóa món ăn thành công khỏi thực đơn' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Lỗi xóa món ăn' });
    }
  }
}

export const menuController = new MenuController();
