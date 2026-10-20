import { Request, Response } from 'express';
import { userManagementService } from '../../services/admin/userManagement.service';

export class UserManagementController {
  public async getUsers(req: Request, res: Response) {
    try {
      const { role, status, search, page, limit } = req.query;
      const result = await userManagementService.getUsers({
        role: role as string,
        status: status as string,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      console.error('[UserManagementController getUsers Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải danh sách người dùng',
        error: err.message,
      });
    }
  }

  public async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await userManagementService.updateUserRole(id, role);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      return res.json({
        success: true,
        message: 'Cập nhật phân quyền thành công',
        data: updated,
      });
    } catch (err: any) {
      console.error('[UserManagementController updateUserRole Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật phân quyền người dùng',
        error: err.message,
      });
    }
  }

  public async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await userManagementService.toggleUserStatus(id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      return res.json({
        success: true,
        message: `Đã ${updated.status === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản thành công`,
        data: updated,
      });
    } catch (err: any) {
      console.error('[UserManagementController toggleUserStatus Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi đổi trạng thái tài khoản',
        error: err.message,
      });
    }
  }

  public async createStaffUser(req: Request, res: Response) {
    try {
      const { name, email, phone, password, department } = req.body;
      const user = await userManagementService.createStaffUser({
        name,
        email,
        phone,
        password,
        department,
      });
      return res.status(201).json({
        success: true,
        message: 'Tạo tài khoản nhân viên thành công',
        data: user,
      });
    } catch (err: any) {
      console.error('[UserManagementController createStaffUser Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tạo tài khoản nhân viên',
        error: err.message,
      });
    }
  }
}

export const userManagementController = new UserManagementController();
