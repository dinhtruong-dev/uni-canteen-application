import { Response } from 'express';
import { cartService } from '../services/cart.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class CartController {
  public getCart(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const cart = cartService.getOrCreateCart(userId);
    res.json({ success: true, data: cart.toJSON() });
  }

  public addItem(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    try {
      const cart = cartService.addItem(userId, req.body);
      res.status(201).json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cart.toJSON() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public updateItem(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const { quantity } = req.body;
    const cart = cartService.updateItemQuantity(userId, req.params.itemId, Number(quantity));
    res.json({ success: true, message: 'Đã cập nhật giỏ hàng', data: cart.toJSON() });
  }

  public removeItem(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const cart = cartService.removeItem(userId, req.params.itemId);
    res.json({ success: true, message: 'Đã xóa món khỏi giỏ hàng', data: cart.toJSON() });
  }

  public clearCart(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const cart = cartService.clearCart(userId);
    res.json({ success: true, message: 'Đã làm trống giỏ hàng', data: cart.toJSON() });
  }
}

export const cartController = new CartController();
