// src/controllers/staff.controller.ts
import { Request, Response } from 'express';
import { Op } from 'sequelize';

import { orderService } from '../services/order.service';
import { interactionService } from '../services/interaction.service';
import { canteenService } from '../services/canteen.service';
import { marketingService } from '../services/marketing.service';
import { socketService } from '../services/socket.service';
import { tableService } from '../services/table.service';
import { menuService } from '../services/menu.service';
import { redisService } from '../services/redis.service';

import {
  Order,
  DiningTable,
  PickupSlot,
  Category,
  Product,
  Voucher,
  Review,
  Canteen,
} from '../models';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

import { OrderStatus, OrderType } from '../types';

export class StaffController {
  private async getCanteenOrders(canteenId?: string): Promise<Order[]> {
    return orderService.getAllOrders(undefined, canteenId);
  }

  // ===========================================================================
  // 1. DASHBOARD
  // ===========================================================================
  public async getDashboard(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const orders = await this.getCanteenOrders(canteenId);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfWeek = startOfToday - 7 * 24 * 3600 * 1000;
      const startOfMonth = startOfToday - 30 * 24 * 3600 * 1000;

      let todayRevenue = 0;
      let weekRevenue = 0;
      let monthRevenue = 0;
      let completedToday = 0;

      let newOrdersCount = 0;
      let preparingCount = 0;
      let readyOrPickupCount = 0;
      let deliveringCount = 0;

      orders.forEach((o) => {
        const orderTime = o.createdAt.getTime();

        if (o.status === 'PENDING') newOrdersCount++;
        else if (o.status === 'PREPARING') preparingCount++;
        else if (o.status === 'READY' || o.status === 'WAITING_PICKUP') readyOrPickupCount++;
        else if (o.status === 'DELIVERING') deliveringCount++;

        if (o.status === 'COMPLETED' || o.isPaid) {
          if (orderTime >= startOfToday) {
            todayRevenue += o.finalAmount;
            if (o.status === 'COMPLETED') completedToday++;
          }
          if (orderTime >= startOfWeek) {
            weekRevenue += o.finalAmount;
          }
          if (orderTime >= startOfMonth) {
            monthRevenue += o.finalAmount;
          }
        }
      });

      const sorted = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const recentOrders = sorted.slice(0, 10).map((o) => {
        const json = typeof (o as any)?.toJSON === 'function' ? (o as any).toJSON() : o;
        const elapsedMinutes = Math.max(0, Math.floor((Date.now() - o.createdAt.getTime()) / 60000));
        return { ...json, elapsedMinutes };
      });

      const pendingOrders = sorted
        .filter((o) => o.status === 'PENDING')
        .map((o) => {
          const json = typeof (o as any)?.toJSON === 'function' ? (o as any).toJSON() : o;
          const elapsedMinutes = Math.max(0, Math.floor((Date.now() - o.createdAt.getTime()) / 60000));
          return { ...json, elapsedMinutes };
        });

      const canteen = await canteenService.getCanteenById(canteenId);

      return res.json({
        success: true,
        data: {
          canteen: canteen
            ? typeof (canteen as any)?.toJSON === 'function'
              ? (canteen as any).toJSON()
              : canteen
            : null,
          kpis: {
            newOrders: newOrdersCount,
            preparing: preparingCount,
            waitingPickup: readyOrPickupCount,
            delivering: deliveringCount,
            completedToday,
            todayRevenue,
            weekRevenue,
            monthRevenue,
          },
          recentOrders,
          pendingOrders,
        },
      });
    } catch (err: any) {
      console.error('[StaffController getDashboard Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải thông tin Dashboard Staff' });
    }
  }

  // ===========================================================================
  // 2. ORDERS LIST
  // ===========================================================================
  public async getOrders(req: Request, res: Response) {
    try {
      const {
        canteenId,
        receiveMethod,
        orderType,
        status,
        paymentStatus,
        search,
        page = '1',
        limit = '20',
      } = req.query;

      let list = await this.getCanteenOrders(canteenId as string);

      const method = (receiveMethod || orderType) as string;
      if (method && method !== 'ALL') {
        if (method === 'PICKUP' || method === 'TAKEAWAY') {
          list = list.filter((o) => o.orderType === 'TAKEAWAY');
        } else {
          list = list.filter((o) => o.orderType === method);
        }
      }

      if (status && status !== 'ALL') {
        list = list.filter((o) => o.status === status);
      }

      if (paymentStatus && paymentStatus !== 'ALL') {
        if (paymentStatus === 'PAID') list = list.filter((o) => o.isPaid === true);
        else if (paymentStatus === 'PENDING') list = list.filter((o) => o.isPaid === false);
      }

      if (search) {
        const query = (search as string).trim().toLowerCase();
        list = list.filter((o) => {
          return (
            o.orderCode.toLowerCase().includes(query) ||
            o.userName.toLowerCase().includes(query) ||
            o.userPhone.toLowerCase().includes(query) ||
            (o.pickupCode && o.pickupCode.toLowerCase().includes(query)) ||
            (o.tableNumber && o.tableNumber.toLowerCase().includes(query)) ||
            (o.deliveryAddressText && o.deliveryAddressText.toLowerCase().includes(query))
          );
        });
      }

      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
      const total = list.length;
      const totalPages = Math.ceil(total / limitNum) || 1;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = list.slice(startIndex, startIndex + limitNum);

      const now = Date.now();
      const enriched = paginated.map((o) => {
        const json = typeof (o as any)?.toJSON === 'function' ? (o as any).toJSON() : o;
        const elapsedMinutes = Math.max(0, Math.floor((now - o.createdAt.getTime()) / 60000));
        return { ...json, elapsedMinutes };
      });

      return res.json({
        success: true,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        data: enriched,
      });
    } catch (err: any) {
      console.error('[StaffController getOrders Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách đơn hàng' });
    }
  }

  // ===========================================================================
  // 3. UPDATE ORDER STATUS
  // ===========================================================================
  public async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = req.params.id;
      const { status: targetStatus, reason } = req.body;

      if (!targetStatus) {
        return res.status(400).json({ success: false, message: 'Thiếu trạng thái cập nhật' });
      }

      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      const currentStatus = order.status;

      if (targetStatus === 'CANCELLED') {
        if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
          return res.status(400).json({
            success: false,
            message: `Không thể hủy đơn hàng ở trạng thái hiện tại (${currentStatus})`,
          });
        }
        await orderService.cancelOrder(order.id, reason);
        return res.json({
          success: true,
          message: `Đã hủy đơn hàng #${order.orderCode} thành công`,
          data: order.toJSON(),
        });
      }

      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY', 'SERVED', 'COMPLETED'],
        READY:
          order.orderType === 'TAKEAWAY'
            ? ['WAITING_PICKUP', 'COMPLETED']
            : order.orderType === 'DELIVERY'
              ? ['DELIVERING', 'COMPLETED']
              : ['SERVED', 'COMPLETED'],
        WAITING_PICKUP: ['COMPLETED'],
        DELIVERING: ['COMPLETED'],
        SERVED: ['COMPLETED'],
        COMPLETED: [],
      };

      const allowed = validTransitions[currentStatus] || [];
      if (!allowed.includes(targetStatus)) {
        return res.status(400).json({
          success: false,
          message: `Chuyển trạng thái không hợp lệ: không thể chuyển từ ${currentStatus} sang ${targetStatus}`,
        });
      }

      const updatedOrder = await orderService.updateStatus(
        order.id,
        targetStatus as OrderStatus,
        reason
      );

      return res.json({
        success: true,
        message:
          targetStatus === 'CONFIRMED'
            ? `Đã duyệt đơn #${order.orderCode} thành công`
            : targetStatus === 'PREPARING'
              ? `Bếp đã nhận đơn #${order.orderCode} và đang nấu`
              : targetStatus === 'SERVED'
                ? `Đã phục vụ mang món ra bàn ${order.tableNumber || ''} cho khách`
                : targetStatus === 'COMPLETED'
                  ? `Đơn hàng #${order.orderCode} đã hoàn tất thành công`
                  : `Đơn hàng #${order.orderCode} đã cập nhật sang trạng thái ${targetStatus}`,
        data: updatedOrder ? updatedOrder.toJSON() : order.toJSON(),
      });
    } catch (err: any) {
      console.error('[StaffController updateOrderStatus Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng' });
    }
  }

  // ===========================================================================
  // 4. VERIFY PICKUP (QR / CODE)
  // ===========================================================================
  public async verifyPickup(req: Request, res: Response) {
    try {
      const { code, canteenId } = req.body;
      if (!code) {
        return res
          .status(400)
          .json({ success: false, message: 'Vui lòng cung cấp mã nhận món hoặc quét mã QR' });
      }

      const clean = String(code).trim();
      const order = await orderService.findOrderByIdOrCode(clean);

      if (!order || (canteenId && canteenId !== 'ALL' && order.canteenId !== canteenId)) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy đơn hàng với mã lấy món "${code}" tại căn tin này!`,
        });
      }

      if (order.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng #${order.orderCode} này đã được nhận trước đó rồi!`,
          data: order.toJSON(),
        });
      }

      if (order.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng #${order.orderCode} đã bị hủy, không thể giao món!`,
          data: order.toJSON(),
        });
      }

      await orderService.updateStatus(order.id, 'COMPLETED');
      order.isPaid = true;

      socketService.emitOrderStatus(order.userId, order.toJSON());

      return res.json({
        success: true,
        message: `Xác nhận khách nhận món thành công! Đơn hàng #${order.orderCode} đã hoàn thành.`,
        data: order.toJSON(),
      });
    } catch (err: any) {
      console.error('[StaffController verifyPickup Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xác nhận mã nhận món' });
    }
  }

  // ===========================================================================
  // 5. PICKUP SLOTS
  // ===========================================================================
  public async getPickupSlots(req: Request, res: Response) {
    try {
      const canteenId = req.query.canteenId as string;
      const where: any = {};
      if (canteenId) where.canteenId = canteenId;

      const slots = await PickupSlot.findAll({ where });
      const data = slots.map((s) =>
        typeof (s as any)?.toJSON === 'function' ? (s as any).toJSON() : s
      );
      return res.json({ success: true, total: data.length, data });
    } catch (err: any) {
      console.warn('[StaffController] getPickupSlots error:', err.message);
      return res.json({ success: true, total: 0, data: [] });
    }
  }

  public async createPickupSlot(req: Request, res: Response) {
    try {
      const { canteenId = 'cant-a', timeRange, maxOrders = 25 } = req.body;
      if (!timeRange) {
        return res
          .status(400)
          .json({ success: false, message: 'Vui lòng cung cấp khung giờ (VD: 11:30 - 11:45)' });
      }
      const id = `ps-${Date.now()}`;
      const slot = await PickupSlot.create({
        id,
        canteenId,
        timeRange,
        maxOrders: Number(maxOrders) || 25,
        currentOrders: 0,
        status: 'AVAILABLE',
      });

      return res.status(201).json({
        success: true,
        message: 'Đã tạo khung giờ nhận món mới',
        data: typeof (slot as any).toJSON === 'function' ? slot.toJSON() : slot,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo khung giờ nhận' });
    }
  }

  public async updatePickupSlot(req: Request, res: Response) {
    try {
      const { timeRange, maxOrders, status } = req.body;
      const updateData: any = {};
      if (timeRange) updateData.timeRange = timeRange;
      if (maxOrders !== undefined) updateData.maxOrders = Number(maxOrders);
      if (status) updateData.status = status;

      await PickupSlot.update(updateData, { where: { id: req.params.id } });
      return res.json({
        success: true,
        message: 'Đã cập nhật khung giờ nhận món',
        data: { id: req.params.id },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật khung giờ nhận món' });
    }
  }

  public async deletePickupSlot(req: Request, res: Response) {
    try {
      await PickupSlot.destroy({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Đã xóa khung giờ nhận món' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa khung giờ nhận món' });
    }
  }

  // ===========================================================================
  // 6. TABLES
  // ===========================================================================
  public async getTables(req: Request, res: Response) {
    try {
      const canteenId = req.query.canteenId as string;
      const rawTables = await tableService.getAllTables(canteenId);

      const tables = await Promise.all(
        rawTables.map(async (t: any) => {
          const item = typeof t?.toJSON === 'function' ? t.toJSON() : { ...t };
          if (item.currentOrderId) {
            const ord = await orderService.getOrderById(item.currentOrderId);
            if (ord) {
              item.orderStatus = ord.status;
              item.orderCode = ord.orderCode;
            }
          }
          return item;
        })
      );

      return res.json({ success: true, total: tables.length, data: tables });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách bàn từ CSDL' });
    }
  }

  public async createTable(req: Request, res: Response) {
    try {
      const {
        tableNumber,
        canteenId = 'cant-a',
        capacity = 4,
        area = 'Khu vực chính',
        qrCode,
        status,
      } = req.body;

      if (!tableNumber) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên/số bàn (VD: Bàn 09)' });
      }

      const newTable = await tableService.createTable({
        tableNumber,
        canteenId,
        capacity,
        area,
        qrCode,
        status,
      });

      return res.status(201).json({
        success: true,
        message: 'Đã tạo bàn ăn & mã QR mới thành công',
        data: (newTable as any).toJSON(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo bàn ăn mới' });
    }
  }

  public async updateTable(req: Request, res: Response) {
    try {
      const updated = await tableService.updateTable(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }
      return res.json({
        success: true,
        message: 'Đã cập nhật thông tin bàn ăn thành công',
        data: (updated as any).toJSON(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật bàn ăn' });
    }
  }

  public async deleteTable(req: Request, res: Response) {
    try {
      const ok = await tableService.deleteTable(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }
      return res.json({ success: true, message: 'Đã xóa bàn ăn khỏi CSDL thành công' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa bàn ăn' });
    }
  }

  public async cleanTable(req: Request, res: Response) {
    try {
      const tableId = req.params.id;
      const table = await tableService.getTableById(tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }

      if (table.currentOrderId) {
        try {
          await orderService.updateStatus(
            table.currentOrderId,
            'COMPLETED',
            'Đã dọn dẹp và làm sạch bàn'
          );
        } catch { }
      }

      const updated = await tableService.updateTableStatus(table.id, 'AVAILABLE');

      socketService.emitTableStatus({
        tableNumber: table.tableNumber,
        isOccupied: false,
      });

      return res.json({
        success: true,
        message: `Đã dọn dẹp và làm sạch ${table.tableNumber} thành công. Bàn hiện đã sẵn sàng đón khách mới!`,
        data: updated ? (updated as any).toJSON?.() || updated : table,
      });
    } catch (err: any) {
      console.error('[StaffController cleanTable Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi làm sạch bàn ăn' });
    }
  }

  // ===========================================================================
  // 7. FOODS
  // ===========================================================================
  public async getFoods(req: Request, res: Response) {
    try {
      const { canteenId, categoryId, search, isAvailable } = req.query;
      const products = await menuService.getProducts({
        canteenId: canteenId as string,
        categoryId: categoryId as string,
        search: search as string,
      });
      let list = products;
      if (isAvailable !== undefined && isAvailable !== 'ALL') {
        const avail = isAvailable === 'true';
        list = list.filter((p) => p.isAvailable === avail);
      }
      return res.json({
        success: true,
        total: list.length,
        data: list.map((p) =>
          typeof (p as any)?.toJSON === 'function' ? (p as any).toJSON() : p
        ),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách món ăn', error: err.message });
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
        return res
          .status(400)
          .json({ success: false, message: 'Vui lòng điền đủ Tên món, Giá bán và Danh mục' });
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
        data: typeof (prod as any)?.toJSON === 'function' ? (prod as any).toJSON() : prod,
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
        data: typeof (prod as any)?.toJSON === 'function' ? (prod as any).toJSON() : prod,
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

  // ===========================================================================
  // 8. CATEGORIES
  // ===========================================================================
  public async getCategories(_req: Request, res: Response) {
    try {
      const categories = await menuService.getAllCategories();
      const enriched = categories.map((cat) =>
        typeof (cat as any)?.toJSON === 'function' ? (cat as any).toJSON() : cat
      );
      return res.json({ success: true, total: enriched.length, data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh mục', error: err.message });
    }
  }

  public async createCategory(req: Request, res: Response) {
    try {
      const { name, description, icon = 'Utensils', image, displayOrder, slug: customSlug } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên danh mục' });
      }
      const id = `cat-${Date.now()}`;
      const slug =
        customSlug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const order = displayOrder !== undefined ? Number(displayOrder) : 1;

      // ✅ Sequelize: create trực tiếp
      const cat = await Category.create({
        id,
        name,
        icon,
        slug,
        image: image || 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
        description: description || '',
        displayOrder: order,
        isActive: true,
      });

      await redisService.delPrefix('categories');

      return res.status(201).json({
        success: true,
        message: `Đã tạo danh mục "${cat.name}"`,
        data: typeof (cat as any)?.toJSON === 'function' ? (cat as any).toJSON() : cat,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo danh mục' });
    }
  }

  public async updateCategory(req: Request, res: Response) {
    try {
      const cat = await menuService.getCategoryById(req.params.id);
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
      }
      const { name, description, icon, image, displayOrder } = req.body;
      const newName = name || cat.name;
      const newDesc = description !== undefined ? description : cat.description;
      const newIcon = icon || cat.icon;
      const newImage = image || cat.image;
      const newOrder = displayOrder !== undefined ? Number(displayOrder) : cat.displayOrder;

      // ✅ Sequelize update
      await Category.update(
        {
          name: newName,
          description: newDesc || '',
          icon: newIcon,
          image: newImage,
          displayOrder: newOrder,
        },
        { where: { id: cat.id } }
      );
      await redisService.delPrefix('categories');

      return res.json({
        success: true,
        message: `Đã cập nhật danh mục "${newName}"`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật danh mục', error: err.message });
    }
  }

  public async deleteCategory(req: Request, res: Response) {
    try {
      const cat = await menuService.getCategoryById(req.params.id);
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
      }

      // ✅ Sequelize destroy
      await Category.destroy({ where: { id: cat.id } });
      await redisService.delPrefix('categories');

      return res.json({ success: true, message: `Đã xóa danh mục "${cat.name}"` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi xóa danh mục', error: err.message });
    }
  }

  // ===========================================================================
  // 9. PROMOTIONS
  // ===========================================================================
  public async getPromotions(_req: Request, res: Response) {
    try {
      const vouchers = await marketingService.getVouchers();
      return res.json({ success: true, total: vouchers.length, data: vouchers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải mã khuyến mãi', error: err.message });
    }
  }

  public async createPromotion(req: Request, res: Response) {
    try {
      const {
        code,
        title,
        description,
        discountType,
        discountValue,
        minOrderAmount = 0,
        maxDiscount,
        usageLimit = 500,
      } = req.body;

      if (!code || !title || discountValue === undefined) {
        return res
          .status(400)
          .json({ success: false, message: 'Vui lòng nhập đầy đủ Mã code, Tiêu đề và Giá trị giảm' });
      }

      const id = `vouch-${Date.now()}`;

      // ✅ Sequelize create trực tiếp
      const voucher = await Voucher.create({
        id,
        code: code.toUpperCase().trim(),
        title,
        description: description || '',
        discountType:
          discountType === 'PERCENT' || discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        usageLimit: Number(usageLimit) || 500,
        usedCount: 0,
        isActive: true,
      });

      await redisService.delPrefix('vouchers');

      return res.status(201).json({
        success: true,
        message: `Đã tạo mã khuyến mãi "${voucher.code}"`,
        data: typeof (voucher as any)?.toJSON === 'function' ? (voucher as any).toJSON() : voucher,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo mã khuyến mãi' });
    }
  }

  public async updatePromotion(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        isActive,
      } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
      if (minOrderAmount !== undefined) updateData.minOrderAmount = Number(minOrderAmount);
      if (maxDiscount !== undefined) updateData.maxDiscount = Number(maxDiscount);
      if (usageLimit !== undefined) updateData.usageLimit = Number(usageLimit);
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      // ✅ Sequelize update
      await Voucher.update(updateData, { where: { id: req.params.id } });
      await redisService.delPrefix('vouchers');

      return res.json({
        success: true,
        message: 'Đã cập nhật mã khuyến mãi thành công',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật mã khuyến mãi', error: err.message });
    }
  }

  public async deletePromotion(req: Request, res: Response) {
    try {
      // ✅ Sequelize destroy
      await Voucher.destroy({ where: { id: req.params.id } });
      await redisService.delPrefix('vouchers');
      return res.json({ success: true, message: 'Đã xóa mã khuyến mãi thành công' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi xóa mã khuyến mãi', error: err.message });
    }
  }

  public async getReviews(req: Request, res: Response) {
    try {
      const { rating, canteenId } = req.query;
      const reviews = await interactionService.getAllReviewsForAdmin(
        canteenId as string,
        rating as string
      );
      return res.json({ success: true, total: reviews.length, data: reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải đánh giá', error: err.message });
    }
  }

  public async replyReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { replyText } = req.body;
      if (!replyText || !replyText.trim()) {
        return res
          .status(400)
          .json({ success: false, message: 'Nội dung phản hồi không được để trống' });
      }
      const ok = await interactionService.replyReview(id, replyText.trim());
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
      }
      return res.json({
        success: true,
        message: 'Đã gửi phản hồi đánh giá thành công',
        data: { id, reply: replyText.trim(), replyText: replyText.trim() },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi gửi phản hồi đánh giá' });
    }
  }

  // ===========================================================================
  // 11. STATISTICS
  // ===========================================================================
  public async getStatistics(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const orders = await this.getCanteenOrders(canteenId);

      const daysMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        daysMap[key] = { date: key, revenue: 0, ordersCount: 0 };
      }

      const methodBreakdown = {
        DINE_IN: { count: 0, revenue: 0 },
        TAKEAWAY: { count: 0, revenue: 0 },
        DELIVERY: { count: 0, revenue: 0 },
      };

      const productSales: Record<
        string,
        { id: string; name: string; image: string; quantity: number; revenue: number }
      > = {};

      let totalRevenue = 0;
      let totalOrders = 0;
      let completedOrders = 0;
      let cancelledOrders = 0;

      orders.forEach((o) => {
        totalOrders++;
        if (o.status === 'COMPLETED') completedOrders++;
        if (o.status === 'CANCELLED') cancelledOrders++;

        if (o.status === 'COMPLETED' || o.isPaid) {
          totalRevenue += o.finalAmount;

          const key = o.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          if (daysMap[key]) {
            daysMap[key].revenue += o.finalAmount;
            daysMap[key].ordersCount += 1;
          }

          const m = o.orderType || 'DINE_IN';
          if (methodBreakdown[m as keyof typeof methodBreakdown]) {
            methodBreakdown[m as keyof typeof methodBreakdown].count += 1;
            methodBreakdown[m as keyof typeof methodBreakdown].revenue += o.finalAmount;
          }

          o.orderDetails?.forEach((d) => {
            if (!productSales[d.productId]) {
              productSales[d.productId] = {
                id: d.productId,
                name: d.productName,
                image: d.productImage,
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[d.productId].quantity += d.quantity;
            productSales[d.productId].revenue += d.itemSubtotal;
          });
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      const dailyChart = Object.values(daysMap);

      return res.json({
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          completedOrders,
          cancelledOrders,
          methodBreakdown,
          dailyChart,
          topProducts,
        },
      });
    } catch (err: any) {
      console.error('[StaffController getStatistics Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tạo báo cáo thống kê' });
    }
  }

  // ===========================================================================
  // 12. CANTEEN INFO & SETTINGS
  // ===========================================================================
  public async getCanteen(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const canteen = await canteenService.getCanteenById(canteenId);
      if (!canteen) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy căn tin' });
      }
      return res.json({
        success: true,
        data: typeof (canteen as any).toJSON === 'function' ? (canteen as any).toJSON() : canteen,
      });
    } catch (err: any) {
      console.error('[StaffController getCanteen Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải thông tin căn tin' });
    }
  }

  public async updateCanteen(req: Request, res: Response) {
    try {
      const canteenId = (req.body.canteenId || req.query.canteenId || 'cant-a') as string;
      const {
        displayName,
        location,
        openingHours,
        isOpen,
        phone,
        voucher,
        freeship,
        image,
      } = req.body;

      const canteen = await Canteen.findByPk(canteenId);
      if (!canteen) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy căn tin' });
      }

      const updateData: any = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (location !== undefined) updateData.location = location;
      if (openingHours !== undefined) updateData.openingHours = openingHours;
      if (isOpen !== undefined) updateData.isOpen = Boolean(isOpen);
      if (phone !== undefined) updateData.phone = phone;
      if (voucher !== undefined) updateData.voucher = voucher;
      if (freeship !== undefined) updateData.freeship = freeship;
      if (image !== undefined) updateData.image = image;

      await canteen.update(updateData);
      await redisService.delPrefix('canteens');

      return res.json({
        success: true,
        message: 'Đã cập nhật thông tin căn tin thành công',
        data: typeof (canteen as any).toJSON === 'function' ? (canteen as any).toJSON() : canteen,
      });
    } catch (err: any) {
      console.error('[StaffController updateCanteen Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông tin căn tin' });
    }
  }

  // ===========================================================================
  // 13. PRODUCT STOCK AVAILABILITY TOGGLE
  // ===========================================================================
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
        data: typeof (prod as any).toJSON === 'function' ? (prod as any).toJSON() : prod,
      });
    } catch (err: any) {
      console.error('[StaffController toggleFoodStock Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái món' });
    }
  }

  // ===========================================================================
  // 14. UPLOAD PRODUCT IMAGE (Cloudinary folder: uni-canteen/products/{productId})
  // ===========================================================================
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
      console.error('[StaffController uploadFoodImage Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải ảnh lên Cloudinary: ' + (err.message || 'Lỗi hệ thống'),
      });
    }
  }
}

export const staffController = new StaffController();