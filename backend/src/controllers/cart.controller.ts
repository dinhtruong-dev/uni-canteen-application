// src/controllers/cart.controller.ts
import { Response } from 'express';
import { cartService } from '../services/cart.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { toPlain } from '../utils/serialize';

export class CartController {
  public async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const cart = await cartService.getCart(userId);
      return res.json({ success: true, data: toPlain(cart) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async addItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const cart = await cartService.addItem(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Đã thêm vào giỏ hàng Redis',
        data: toPlain(cart),
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(
        userId,
        req.params.itemId,
        Number(quantity)
      );
      return res.json({
        success: true,
        message: 'Đã cập nhật giỏ hàng',
        data: toPlain(cart),
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public async removeItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const cart = await cartService.removeItem(userId, req.params.itemId);
      return res.json({
        success: true,
        message: 'Đã xóa món khỏi giỏ hàng',
        data: toPlain(cart),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async syncCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const { items } = req.body;
      const cart = await cartService.syncCart(
        userId,
        Array.isArray(items) ? items : []
      );
      return res.json({
        success: true,
        message: 'Đồng bộ giỏ hàng với Redis thành công',
        data: toPlain(cart),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const cart = await cartService.clearCart(userId);
      return res.json({
        success: true,
        message: 'Đã làm trống giỏ hàng Redis',
        data: toPlain(cart),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const cartController = new CartController();