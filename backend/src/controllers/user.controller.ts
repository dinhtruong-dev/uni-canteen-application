import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UserController {
  public getCurrentUser(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const user = userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản' });
    }
    res.json({ success: true, data: user.toJSON() });
  }

  public getAddresses(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const addresses = userService.getAddressesByUserId(userId).map((a) => a.toJSON());
    res.json({ success: true, data: addresses });
  }

  public createAddress(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const address = userService.createAddress(userId, req.body);
    res.status(201).json({ success: true, message: 'Đã thêm địa chỉ KTX mới', data: address.toJSON() });
  }

  public deleteAddress(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const deleted = userService.deleteAddress(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    }
    res.json({ success: true, message: 'Đã xóa địa chỉ' });
  }

  public getFavorites(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const targetType = req.query.targetType as any;
    const favorites = userService.getFavoritesByUserId(userId, targetType).map((f) => f.toJSON());
    res.json({ success: true, data: favorites });
  }

  public toggleFavorite(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const { targetType, targetId } = req.body;
    const result = userService.toggleFavorite(userId, targetType, targetId);
    res.json({
      success: true,
      data: result,
      message: result.isFavorite ? 'Đã thêm vào mục yêu thích' : 'Đã bỏ khỏi mục yêu thích',
    });
  }
}

export const userController = new UserController();
