import { Request, Response } from 'express';
import { systemConfigService } from '../../services/admin/systemConfig.service';
import { interactionService } from '../../services/shared/interaction.service';
import { socketManager } from '../../socket';

export class SystemConfigController {
  public async getConfig(_req: Request, res: Response) {
    try {
      const config = await systemConfigService.getConfig();
      return res.json({
        success: true,
        data: config,
      });
    } catch (err: any) {
      console.error('[SystemConfigController getConfig Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải cấu hình hệ thống',
        error: err.message,
      });
    }
  }

  public async updateConfig(req: Request, res: Response) {
    try {
      const config = await systemConfigService.updateConfig(req.body);
      return res.json({
        success: true,
        message: 'Cập nhật cấu hình hệ thống thành công',
        data: config,
      });
    } catch (err: any) {
      console.error('[SystemConfigController updateConfig Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật cấu hình hệ thống',
        error: err.message,
      });
    }
  }

  public async pushNotification(req: Request, res: Response) {
    try {
      const { target = 'ALL', title, message, type = 'SYSTEM' } = req.body;
      if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung không được để trống' });
      }

      const isBroadcast = target === 'ALL';

      const notif = await interactionService.createNotification({
        userId: isBroadcast ? null : target,
        title: title.trim(),
        message: message.trim(),
        type,
      });

      const notifJson = typeof (notif as any)?.toJSON === 'function'
        ? (notif as any).toJSON()
        : notif;

      if (isBroadcast) {
        socketManager.broadcastNotification(notifJson);
      } else {
        socketManager.sendNotificationToUser(target, notifJson);
      }

      return res.status(201).json({
        success: true,
        message: isBroadcast
          ? 'Đã phát thông báo tới toàn bộ người dùng'
          : `Đã gửi tới user ${target}`,
        data: notifJson,
      });
    } catch (err: any) {
      console.error('[SystemConfigController pushNotification Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi phát thông báo từ Admin',
        error: err.message,
      });
    }
  }
}

export const systemConfigController = new SystemConfigController();
