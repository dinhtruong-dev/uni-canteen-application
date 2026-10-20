import { Request, Response } from 'express';
import { menuService } from '../../services/shared/menu.service';
import { redisService } from '../../services/infrastructure/redis.service';
import { Product } from '../../models';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { toPlain, toPlainList } from '../../utils/serialize';

export class FoodController {
  public async getFoods(req: Request, res: Response) {
    try {
      const { categoryId, canteenId, search, minPrice, maxPrice, isBestSeller, isVegetarian, isAvailable } = req.query;
      const products = await menuService.getProducts({
        categoryId: categoryId as string,
        canteenId: canteenId as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isBestSeller: isBestSeller === 'true',
        isVegetarian: isVegetarian === 'true',
      });

      let list = products;
      if (isAvailable !== undefined && isAvailable !== 'ALL') {
        const avail = isAvailable === 'true';
        list = list.filter((p) => p.isAvailable === avail);
      }

      return res.json({
        success: true,
        total: list.length,
        data: toPlainList(list),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải danh sách món ăn',
        error: err.message,
      });
    }
  }

  public async getFoodDetail(req: Request, res: Response) {
    try {
      const product = await menuService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      const optList = await menuService.getProductOptions(product.id);
      const options = optList.map((opt: any) => (typeof opt?.toJSON === 'function' ? opt.toJSON() : opt));
      return res.json({
        success: true,
        data: {
          ...toPlain(product),
          options,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết món ăn', error: err.message });
    }
  }

  public async createFood(req: Request, res: Response) {
    try {
      const {
        name,
        price,
        originalPrice,
        categoryId,
        canteenId = 'cant-a',
        image,
        description,
        preparationTime = 10,
        calories = 500,
        isAvailable = true,
      } = req.body;

      if (!name || price === undefined || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đủ Tên món, Giá bán và Danh mục',
        });
      }

      const prod = await menuService.createProduct({
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId,
        canteenId,
        image,
        description,
        preparationTime: Number(preparationTime) || 10,
        calories: Number(calories) || 500,
        isAvailable: isAvailable !== false,
      });

      return res.status(201).json({
        success: true,
        message: `Đã thêm món "${prod.name}" vào menu`,
        data: toPlain(prod),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi thêm món ăn mới: ' + err.message });
    }
  }

  public async updateFood(req: Request, res: Response) {
    try {
      const prod = await menuService.updateProduct(req.params.id, req.body);
      if (!prod) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      return res.json({
        success: true,
        message: `Đã cập nhật món "${prod.name}"`,
        data: toPlain(prod),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật món ăn' });
    }
  }

  public async deleteFood(req: Request, res: Response) {
    try {
      const ok = await menuService.deleteProduct(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }
      return res.json({ success: true, message: 'Đã xóa món ăn khỏi thực đơn' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa món ăn' });
    }
  }

  public async toggleFoodStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;

      const prod = await Product.findByPk(id);
      if (!prod) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
      }

      await prod.update({ isAvailable: Boolean(isAvailable) });
      await redisService.delPrefix('products');

      return res.json({
        success: true,
        message: `Đã chuyển trạng thái món sang: ${isAvailable ? 'Còn hàng' : 'Tạm hết món'}`,
        data: toPlain(prod),
      });
    } catch (err: any) {
      console.error('[FoodController.toggleFoodStock Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái món' });
    }
  }

  public async uploadFoodImage(req: Request, res: Response) {
    try {
      let buffer: Buffer | null = null;
      const productId = req.body.productId || req.query.productId || `prod-${Date.now()}`;
      const folder = `uni-canteen/products/${productId}`;

      if (req.file) {
        buffer = req.file.buffer;
      } else if (req.body.image && typeof req.body.image === 'string') {
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
      }

      if (!buffer) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp tệp ảnh hoặc chuỗi base64 hợp lệ',
        });
      }

      const result = await uploadToCloudinary(buffer, folder);

      return res.json({
        success: true,
        message: 'Tải ảnh món ăn lên Cloudinary thành công',
        url: result.secure_url,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (err: any) {
      console.error('[FoodController.uploadFoodImage Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải ảnh lên Cloudinary: ' + (err.message || 'Lỗi hệ thống'),
      });
    }
  }
}

export const foodController = new FoodController();
