import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UserController {
  public async getAllUsers(_req: Request, res: Response) {
    try {
      const userList = await userService.getAllUsers();
      const users = userList.map((u: any) => (typeof u?.toJSON === 'function' ? u.toJSON() : u));
      res.json({ success: true, total: users.length, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng', error: err.message });
    }
  }

  public async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản' });
      }
      const data = typeof (user as any)?.toJSON === 'function' ? (user as any).toJSON() : user;
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải thông tin tài khoản', error: err.message });
    }
  }

  public getAddresses(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const addresses = userService
        .getAddressesByUserId(userId)
        .map((a: any) => (typeof a?.toJSON === 'function' ? a.toJSON() : a));
      res.json({ success: true, data: addresses });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách địa chỉ', error: err.message });
    }
  }

  public createAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const address = userService.createAddress(userId, req.body);
      const data = typeof (address as any)?.toJSON === 'function' ? (address as any).toJSON() : address;
      res.status(201).json({ success: true, message: 'Đã thêm địa chỉ KTX mới', data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tạo địa chỉ mới', error: err.message });
    }
  }

  public deleteAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const deleted = userService.deleteAddress(userId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }
      res.json({ success: true, message: 'Đã xóa địa chỉ' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi xóa địa chỉ', error: err.message });
    }
  }

  public getFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const targetType = req.query.targetType as any;
      const favorites = userService
        .getFavoritesByUserId(userId, targetType)
        .map((f: any) => (typeof f?.toJSON === 'function' ? f.toJSON() : f));
      res.json({ success: true, data: favorites });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách yêu thích', error: err.message });
    }
  }

  public toggleFavorite(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const { targetType, targetId } = req.body;
      const result = userService.toggleFavorite(userId, targetType, targetId);
      res.json({
        success: true,
        data: result,
        message: result.isFavorite ? 'Đã thêm vào mục yêu thích' : 'Đã bỏ khỏi mục yêu thích',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật yêu thích', error: err.message });
    }
  }
  public async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      const data = typeof (user as any)?.toJSON === 'function' ? (user as any).toJSON() : user;
      res.status(201).json({ success: true, message: 'Tạo người dùng thành công', data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tạo người dùng', error: err.message });
    }
  }

  public async updateUser(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      const data = typeof (user as any)?.toJSON === 'function' ? (user as any).toJSON() : user;
      res.json({ success: true, message: 'Cập nhật người dùng thành công', data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật người dùng', error: err.message });
    }
  }

  public async deleteUser(req: Request, res: Response) {
    try {
      const deleted = await userService.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      res.json({ success: true, message: 'Xóa người dùng thành công' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi xóa người dùng', error: err.message });
    }
  }

  public async updateRole(req: Request, res: Response) {
    try {
      const user = await userService.updateUserRole(req.params.id, req.body.role);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      const data = typeof (user as any)?.toJSON === 'function' ? (user as any).toJSON() : user;
      res.json({ success: true, message: 'Cập nhật quyền hạn thành công', data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật quyền', error: err.message });
    }
  }

  public async toggleStatus(req: Request, res: Response) {
    try {
      const user = await userService.toggleUserStatus(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      const data = typeof (user as any)?.toJSON === 'function' ? (user as any).toJSON() : user;
      res.json({
        success: true,
        message: user.status === 'ACTIVE' ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi thay đổi trạng thái người dùng', error: err.message });
    }
  }

  public async topUpWallet(req: Request, res: Response) {
    try {
      const amount = Number(req.body.amount) || 0;
      const user = await userService.topUpUserWallet(req.params.id, amount);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      const data = typeof (user as any)?.toJSON === 'function' ? (user as any).toJSON() : user;
      res.json({ success: true, message: `Nạp thành công ${amount.toLocaleString('vi-VN')}đ`, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi nạp tiền vào ví', error: err.message });
    }
  }
}

export const userController = new UserController();
