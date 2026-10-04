import { Request, Response } from 'express';
import { executeQuery } from '../config/db.config';
import { db } from '../services/database.service';
import { interactionService } from '../services/interaction.service';

export class AdminController {
  /**
   * 1. Overview Dashboard (Thống kê thực từ MySQL DB)
   */
  public async getOverview(req: Request, res: Response) {
    try {
      // 1.1 Doanh thu và đơn hàng
      const revenueRow: any = await executeQuery(`
        SELECT 
          COALESCE(SUM(CASE WHEN is_paid = 1 AND status != 'CANCELLED' THEN final_amount ELSE 0 END), 0) as totalRevenue,
          COALESCE(SUM(CASE WHEN is_paid = 1 AND status != 'CANCELLED' AND created_at >= CURDATE() THEN final_amount ELSE 0 END), 0) as todayRevenue,
          COUNT(*) as totalOrders,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingOrders,
          COUNT(CASE WHEN status IN ('CONFIRMED', 'PREPARING') THEN 1 END) as cookingOrders,
          COUNT(CASE WHEN status IN ('READY', 'SERVED', 'DELIVERING') THEN 1 END) as deliveringOrders,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedOrders,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelledOrders
        FROM orders
      `);

      const revData = Array.isArray(revenueRow) && revenueRow[0] ? revenueRow[0] : {
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        cookingOrders: 0,
        deliveringOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      };

      // 1.2 Phân bổ theo hình thức nhận món (DINE_IN, TAKEAWAY/PICKUP, DELIVERY)
      const orderTypeRows: any = await executeQuery(`
        SELECT order_type, COUNT(*) as count 
        FROM orders 
        GROUP BY order_type
      `);

      // 1.3 Phân bổ trạng thái đơn
      const statusRows: any = await executeQuery(`
        SELECT status, COUNT(*) as count 
        FROM orders 
        GROUP BY status
      `);

      // 1.4 Doanh thu 7 ngày gần nhất
      const trendRows: any = await executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%d/%m') as date,
          COALESCE(SUM(CASE WHEN is_paid = 1 AND status != 'CANCELLED' THEN final_amount ELSE 0 END), 0) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d/%m')
        ORDER BY DATE(created_at) ASC
      `);

      // 1.5 Người dùng và cơ sở vật chất
      const userRows: any = await executeQuery(`
        SELECT 
          COUNT(CASE WHEN role = 'STUDENT' THEN 1 END) as totalStudents,
          COUNT(CASE WHEN role = 'STAFF' THEN 1 END) as totalStaff,
          COUNT(*) as totalUsers
        FROM users
      `);

      const tableRows: any = await executeQuery(`
        SELECT 
          COUNT(*) as totalTables,
          COUNT(CASE WHEN status = 'OCCUPIED' THEN 1 END) as occupiedTables,
          COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as availableTables
        FROM dining_tables
      `);

      return res.json({
        success: true,
        data: {
          kpis: {
            totalRevenue: Number(revData.totalRevenue) || 0,
            todayRevenue: Number(revData.todayRevenue) || 0,
            totalOrders: Number(revData.totalOrders) || 0,
            pendingOrders: Number(revData.pendingOrders) || 0,
            cookingOrders: Number(revData.cookingOrders) || 0,
            deliveringOrders: Number(revData.deliveringOrders) || 0,
            completedOrders: Number(revData.completedOrders) || 0,
            cancelledOrders: Number(revData.cancelledOrders) || 0,
            totalStudents: Number(userRows?.[0]?.totalStudents) || db.users.size,
            totalStaff: Number(userRows?.[0]?.totalStaff) || 5,
            totalTables: Number(tableRows?.[0]?.totalTables) || db.tables.size,
            occupiedTables: Number(tableRows?.[0]?.occupiedTables) || 0,
          },
          orderTypes: Array.isArray(orderTypeRows) ? orderTypeRows : [],
          statuses: Array.isArray(statusRows) ? statusRows : [],
          revenueTrends: Array.isArray(trendRows) ? trendRows : [],
        },
      });
    } catch (err: any) {
      console.error('[AdminController getOverview Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi nạp dữ liệu thống kê từ CSDL', error: err.message });
    }
  }

  /**
   * 2. Deep Analytics & Statistics (Thống kê chuyên sâu từ MySQL DB)
   */
  public async getStatistics(req: Request, res: Response) {
    try {
      // 2.1 Hiệu suất từng quầy căn tin
      const canteenStats: any = await executeQuery(`
        SELECT 
          c.id,
          c.name,
          COALESCE(COUNT(o.id), 0) as orders,
          COALESCE(SUM(CASE WHEN o.is_paid = 1 AND o.status != 'CANCELLED' THEN o.final_amount ELSE 0 END), 0) as revenue,
          ROUND(COALESCE(COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) * 100.0 / NULLIF(COUNT(o.id), 0), 0), 1) as cancelRate
        FROM canteens c
        LEFT JOIN orders o ON c.id = o.canteen_id
        GROUP BY c.id, c.name
      `);

      // 2.2 Phân bổ khung giờ cao điểm
      const hourlyStats: any = await executeQuery(`
        SELECT 
          HOUR(created_at) as hourNum,
          COUNT(*) as orders
        FROM orders
        GROUP BY HOUR(created_at)
        ORDER BY hourNum ASC
      `);

      const formattedHours = [
        { hour: '07h-08h', orders: 0 },
        { hour: '08h-09h', orders: 0 },
        { hour: '11h-12h', orders: 0 },
        { hour: '12h-13h', orders: 0 },
        { hour: '13h-14h', orders: 0 },
        { hour: '17h-18h', orders: 0 },
        { hour: '18h-19h', orders: 0 },
        { hour: '19h-20h', orders: 0 },
      ];

      if (Array.isArray(hourlyStats)) {
        hourlyStats.forEach((h: any) => {
          const hn = Number(h.hourNum);
          if (hn >= 7 && hn < 8) formattedHours[0].orders += Number(h.orders);
          else if (hn >= 8 && hn < 9) formattedHours[1].orders += Number(h.orders);
          else if (hn >= 11 && hn < 12) formattedHours[2].orders += Number(h.orders);
          else if (hn >= 12 && hn < 13) formattedHours[3].orders += Number(h.orders);
          else if (hn >= 13 && hn < 14) formattedHours[4].orders += Number(h.orders);
          else if (hn >= 17 && hn < 18) formattedHours[5].orders += Number(h.orders);
          else if (hn >= 18 && hn < 19) formattedHours[6].orders += Number(h.orders);
          else if (hn >= 19 && hn < 20) formattedHours[7].orders += Number(h.orders);
        });
      }

      return res.json({
        success: true,
        data: {
          canteens: Array.isArray(canteenStats) ? canteenStats.map((c: any) => ({
            name: c.name,
            revenue: Number(c.revenue) || 0,
            orders: Number(c.orders) || 0,
            cancelRate: Number(c.cancelRate) || 0,
          })) : [],
          hourly: formattedHours,
        },
      });
    } catch (err: any) {
      console.error('[AdminController getStatistics Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi nạp báo cáo thống kê chuyên sâu', error: err.message });
    }
  }

  /**
   * 3. Phát thông báo từ Admin (Lưu CSDL & Bắn Socket.IO tức thì)
   */
  public async pushNotification(req: Request, res: Response) {
    try {
      const { target = 'ALL', title, message, type = 'SYSTEM' } = req.body;
      if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung thông báo không được để trống' });
      }

      const notif = await interactionService.createNotification({
        userId: target,
        title: title.trim(),
        message: message.trim(),
        type: type,
      });

      return res.status(201).json({
        success: true,
        message: `Đã phát thông báo thành công tới ${target === 'ALL' ? 'toàn bộ người dùng' : target}`,
        data: typeof (notif as any)?.toJSON === 'function' ? (notif as any).toJSON() : notif,
      });
    } catch (err: any) {
      console.error('[AdminController pushNotification Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi phát thông báo từ Admin', error: err.message });
    }
  }

  /**
   * 4. Quản lý Đánh giá từ Admin (Lấy từ MySQL DB)
   */
  public async getReviews(req: Request, res: Response) {
    try {
      const { canteenId, rating } = req.query;
      const reviews = await interactionService.getAllReviewsForAdmin(canteenId as string, rating as string);
      return res.json({ success: true, total: reviews.length, data: reviews });
    } catch (err: any) {
      console.error('[AdminController getReviews Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách đánh giá', error: err.message });
    }
  }

  public async toggleReviewVisibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const ok = await interactionService.toggleReviewVisibility(id, status);
      return res.json({ success: ok, message: ok ? 'Đã cập nhật trạng thái hiển thị đánh giá' : 'Không tìm thấy đánh giá' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật hiển thị đánh giá' });
    }
  }

  public async replyReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { replyText } = req.body;
      if (!replyText || !replyText.trim()) {
        return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống' });
      }
      const ok = await interactionService.replyReview(id, replyText.trim());
      return res.json({ success: ok, message: ok ? 'Đã gửi phản hồi đánh giá thành công' : 'Không tìm thấy đánh giá' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi gửi phản hồi đánh giá' });
    }
  }
}

export const adminController = new AdminController();
