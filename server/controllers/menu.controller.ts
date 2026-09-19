import { Request, Response } from 'express';
import { menuService } from '../services/menu.service';

export class MenuController {
  public getCategories(_req: Request, res: Response) {
    const categories = menuService.getAllCategories().map((c) => c.toJSON());
    res.json({ success: true, data: categories });
  }

  public getProducts(req: Request, res: Response) {
    const { categoryId, canteenId, search, minPrice, maxPrice, isBestSeller, isVegetarian } = req.query;

    const products = menuService.getProducts({
      categoryId: categoryId as string,
      canteenId: canteenId as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isBestSeller: isBestSeller === 'true',
      isVegetarian: isVegetarian === 'true',
    }).map((p) => p.toJSON());

    res.json({ success: true, total: products.length, data: products });
  }

  public getProductDetail(req: Request, res: Response) {
    const product = menuService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
    }
    const options = menuService.getProductOptions(product.id).map((opt) => opt.toJSON());
    res.json({
      success: true,
      data: {
        ...product.toJSON(),
        options,
      },
    });
  }
}

export const menuController = new MenuController();
