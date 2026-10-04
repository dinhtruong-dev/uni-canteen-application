import { Request, Response } from 'express';
import { db } from '../services/database.service';
import { orderService } from '../services/order.service';
import { socketService } from '../services/socket.service';
import { executeQuery } from '../config/db.config';
import { redisService } from '../services/redis.service';
import { menuService } from '../services/menu.service';
import { tableService } from '../services/table.service';
import { Order, OrderStatus, OrderType, DiningTable, PickupSlot, Category, Product, Voucher, Review } from '../models';

export class StaffController {
  /**
   * Helper to filter orders for a canteen
   */
  private async getCanteenOrders(canteenId?: string): Promise<Order[]> {
    return orderService.getAllOrders(undefined, canteenId);
  }

  /**
   * 1. Dashboard Summary: KPIs, Recent Orders, Quick Stats
   */
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

      // Recent 10 orders sorted by createdAt desc
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

      const canteen = db.canteens.get(canteenId);

      return res.json({
        success: true,
        data: {
          canteen: canteen ? (typeof (canteen as any)?.toJSON === 'function' ? (canteen as any).toJSON() : canteen) : null,
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

  /**
   * 2. Quản lý Đơn hàng: Data Table với Filter, Search, Pagination
   */
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

      // Filter by receive method / order type
      const method = (receiveMethod || orderType) as string;
      if (method && method !== 'ALL') {
        if (method === 'PICKUP' || method === 'TAKEAWAY') {
          list = list.filter((o) => o.orderType === 'TAKEAWAY');
        } else {
          list = list.filter((o) => o.orderType === method);
        }
      }

      // Filter by Status
      if (status && status !== 'ALL') {
        list = list.filter((o) => o.status === status);
      }

      // Filter by Payment Status
      if (paymentStatus && paymentStatus !== 'ALL') {
        if (paymentStatus === 'PAID') {
          list = list.filter((o) => o.isPaid === true);
        } else if (paymentStatus === 'PENDING') {
          list = list.filter((o) => o.isPaid === false);
        }
      }

      // Search by code, customer name, phone, table, pickup code
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

      // Sort newest first
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Pagination
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

  /**
   * 3. Chuyển trạng thái đơn hàng theo luồng chuẩn (Duyệt đơn, Đưa về máy POS bếp nấu, Hoàn thành, Hủy)
   */
  public async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = req.params.id;
      const { status: targetStatus, reason } = req.body;

      if (!targetStatus) {
        return res.status(400).json({ success: false, message: 'Thiếu trạng thái cập nhật' });
      }

      const order = orderService.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      const currentStatus = order.status;

      // Handle Cancel
      if (targetStatus === 'CANCELLED') {
        if (!order.canCancel()) {
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

      // Transition validation based on receiveMethod
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY', 'SERVED', 'COMPLETED'],
        READY: order.orderType === 'TAKEAWAY'
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

      // Cập nhật trạng thái và lưu trực tiếp vào CSDL MySQL
      const updatedOrder = await orderService.updateStatus(order.id, targetStatus as OrderStatus, reason);

      return res.json({
        success: true,
        message: targetStatus === 'CONFIRMED'
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

  /**
   * 4. Quét QR / Xác nhận mã lấy món (PICKUP verification)
   */
  public async verifyPickup(req: Request, res: Response) {
    try {
      const { code, canteenId } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã nhận món hoặc quét mã QR' });
      }

      const clean = String(code).trim().toUpperCase();
      const orders = Array.from(db.orders.values());

      const order = orders.find((o) => {
        const matchCode =
          o.id === code ||
          o.orderCode.toUpperCase() === clean ||
          (o.pickupCode && o.pickupCode.toUpperCase() === clean) ||
          `#${o.orderCode}`.toUpperCase() === clean;
        const matchCanteen = !canteenId || canteenId === 'ALL' || o.canteenId === canteenId;
        return matchCode && matchCanteen;
      });

      if (!order) {
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

      // Update to COMPLETED in MySQL and release dining table
      await orderService.updateStatus(order.id, 'COMPLETED');
      order.isPaid = true;

      // Emit Socket event to Customer and KDS
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

  /**
   * 5. Khung giờ nhận món (Pickup Slots)
   */
  public getPickupSlots(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    let slots = Array.from(db.pickupSlots.values());
    if (canteenId && canteenId !== 'ALL') {
      slots = slots.filter((s) => s.canteenId === canteenId);
    }
    return res.json({ success: true, total: slots.length, data: slots.map((s) => s.toJSON()) });
  }

  public createPickupSlot(req: Request, res: Response) {
    try {
      const { canteenId = 'cant-a', timeRange, maxOrders = 25 } = req.body;
      if (!timeRange) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp khung giờ (VD: 11:30 - 11:45)' });
      }
      const id = `ps-${Date.now()}`;
      const slot = new PickupSlot(id, canteenId, timeRange, Number(maxOrders) || 25, 0, 'AVAILABLE');
      db.pickupSlots.set(slot.id, slot);
      return res.status(201).json({ success: true, message: 'Đã tạo khung giờ nhận món mới', data: slot.toJSON() });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo khung giờ nhận' });
    }
  }

  public updatePickupSlot(req: Request, res: Response) {
    const slot = db.pickupSlots.get(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ nhận' });
    }
    const { timeRange, maxOrders, status } = req.body;
    if (timeRange) slot.timeRange = timeRange;
    if (maxOrders !== undefined) slot.maxOrders = Number(maxOrders);
    if (status) slot.status = status;
    slot.updatedAt = new Date();

    return res.json({ success: true, message: 'Đã cập nhật khung giờ nhận món', data: slot.toJSON() });
  }

  public deletePickupSlot(req: Request, res: Response) {
    const ok = db.pickupSlots.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ nhận' });
    }
    return res.json({ success: true, message: 'Đã xóa khung giờ nhận món' });
  }

  /**
   * 6. Quản lý Bàn & QR (Lấy trực tiếp từ MySQL CSDL)
   */
  public async getTables(req: Request, res: Response) {
    try {
      const canteenId = req.query.canteenId as string;
      const rawTables = await tableService.getAllTables(canteenId);
      const tables = rawTables.map((t: any) => {
        const item = typeof t?.toJSON === 'function' ? t.toJSON() : { ...t };
        if (item.currentOrderId) {
          const ord = orderService.getOrderById(item.currentOrderId);
          if (ord) {
            item.orderStatus = ord.status;
            item.orderCode = ord.orderCode;
          }
        }
        return item;
      });
      return res.json({ success: true, total: tables.length, data: tables });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách bàn từ CSDL' });
    }
  }

  public async createTable(req: Request, res: Response) {
    try {
      const { tableNumber, canteenId = 'cant-a', capacity = 4, area = 'Khu vực chính', qrCode, status } = req.body;
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
        data: newTable.toJSON(),
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
        data: updated.toJSON(),
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

  /**
   * Làm sạch bàn ăn sau khi khách dùng bữa xong -> đẩy bàn về AVAILABLE (trống)
   */
  public async cleanTable(req: Request, res: Response) {
    try {
      const tableId = req.params.id;
      const table = await tableService.getTableById(tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }

      if (table.currentOrderId) {
        try {
          await orderService.updateStatus(table.currentOrderId, 'COMPLETED', 'Đã dọn dẹp và làm sạch bàn');
        } catch {}
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

  /**
   * 7. Quản lý Món ăn (Foods)
   */
  public getFoods(req: Request, res: Response) {
    const { canteenId, categoryId, search, isAvailable } = req.query;
    let list = Array.from(db.products.values());

    if (canteenId && canteenId !== 'ALL') {
      list = list.filter((p) => p.canteenId === canteenId);
    }
    if (categoryId && categoryId !== 'ALL') {
      list = list.filter((p) => p.categoryId === categoryId);
    }
    if (isAvailable !== undefined && isAvailable !== 'ALL') {
      const avail = isAvailable === 'true';
      list = list.filter((p) => p.isAvailable === avail);
    }
    if (search) {
      const q = (search as string).toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    return res.json({
      success: true,
      total: list.length,
      data: list.map((p) => {
        const cat = db.categories.get(p.categoryId);
        return {
          ...p.toJSON(),
          categoryName: cat ? cat.name : 'Khác',
        };
      }),
    });
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
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Tên món, Giá bán và Danh mục' });
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

  /**
   * 8. Quản lý Danh mục (Categories)
   */
  public getCategories(_req: Request, res: Response) {
    const list = Array.from(db.categories.values()).sort((a, b) => a.displayOrder - b.displayOrder);
    const enriched = list.map((cat) => {
      const foodCount = Array.from(db.products.values()).filter((p) => p.categoryId === cat.id).length;
      return {
        ...(typeof (cat as any)?.toJSON === 'function' ? (cat as any).toJSON() : cat),
        foodCount,
      };
    });
    return res.json({ success: true, total: enriched.length, data: enriched });
  }

  public async createCategory(req: Request, res: Response) {
    try {
      const { name, description, icon = 'Utensils', image, displayOrder, slug: customSlug } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên danh mục' });
      }
      const id = `cat-${Date.now()}`;
      const slug = customSlug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const order = displayOrder !== undefined ? Number(displayOrder) : db.categories.size + 1;
      const cat = new Category(id, name, icon, image || 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', order, description || '');
      db.categories.set(cat.id, cat);

      try {
        await executeQuery(
          `INSERT INTO categories (id, name, icon, slug, image, description, display_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), icon = VALUES(icon), image = VALUES(image), display_order = VALUES(display_order)`,
          [cat.id, cat.name, cat.icon, slug, cat.image, cat.description || '', cat.displayOrder, 1]
        );
      } catch (dbErr: any) {
        console.warn('[StaffController createCategory MySQL notice]:', dbErr.message);
      }
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
    const cat = db.categories.get(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    const { name, description, icon, image, displayOrder, slug } = req.body;
    if (name) cat.name = name;
    if (description !== undefined) cat.description = description;
    if (icon) cat.icon = icon;
    if (image) cat.image = image;
    if (displayOrder !== undefined) cat.displayOrder = Number(displayOrder);

    try {
      await executeQuery(
        `UPDATE categories SET name = ?, description = ?, icon = ?, image = ?, display_order = ? WHERE id = ?`,
        [cat.name, cat.description || '', cat.icon, cat.image, cat.displayOrder, cat.id]
      );
    } catch (dbErr: any) {
      console.warn('[StaffController updateCategory MySQL notice]:', dbErr.message);
    }
    await redisService.delPrefix('categories');

    return res.json({
      success: true,
      message: `Đã cập nhật danh mục "${cat.name}"`,
      data: typeof (cat as any)?.toJSON === 'function' ? (cat as any).toJSON() : cat,
    });
  }

  public async deleteCategory(req: Request, res: Response) {
    const cat = db.categories.get(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    // Check if any product belongs to this category
    const hasFoods = Array.from(db.products.values()).some((p) => p.categoryId === cat.id);
    if (hasFoods) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục "${cat.name}" vì vẫn còn món ăn thuộc danh mục này!`,
      });
    }
    db.categories.delete(req.params.id);

    try {
      await executeQuery('DELETE FROM categories WHERE id = ?', [cat.id]);
    } catch (dbErr: any) {
      console.warn('[StaffController deleteCategory MySQL notice]:', dbErr.message);
    }
    await redisService.delPrefix('categories');

    return res.json({ success: true, message: `Đã xóa danh mục "${cat.name}"` });
  }

  /**
   * 9. Quản lý Khuyến mãi (Vouchers / Promotions)
   */
  public getPromotions(_req: Request, res: Response) {
    const list = Array.from(db.vouchers.values()).map((v: any) =>
      typeof v?.toJSON === 'function' ? v.toJSON() : v
    );
    return res.json({ success: true, total: list.length, data: list });
  }

  public async createPromotion(req: Request, res: Response) {
    try {
      const { code, title, description, discountType, discountValue, minOrderAmount = 0, maxDiscount, usageLimit = 500 } = req.body;
      if (!code || !title || discountValue === undefined) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Mã code, Tiêu đề và Giá trị giảm' });
      }
      const id = `vouch-${Date.now()}`;
      const voucher = new Voucher(
        id,
        code.toUpperCase().trim(),
        title,
        description || '',
        discountType === 'PERCENT' || discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
        Number(discountValue),
        Number(minOrderAmount) || 0,
        {
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          usageLimit: Number(usageLimit) || 500,
          usedCount: 0,
          isActive: true,
        }
      );
      db.vouchers.set(voucher.id, voucher);

      try {
        await executeQuery(
          `INSERT INTO vouchers (id, code, title, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), discount_value = VALUES(discount_value), min_order_amount = VALUES(min_order_amount)`,
          [
            voucher.id,
            voucher.code,
            voucher.title,
            voucher.description,
            voucher.discountType,
            voucher.discountValue,
            voucher.minOrderAmount,
            voucher.maxDiscount || null,
            voucher.usageLimit,
            0,
            voucher.isActive ? 1 : 0,
          ]
        );
      } catch (dbErr: any) {
        console.warn('[StaffController createPromotion MySQL notice]:', dbErr.message);
      }
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
    const voucher = db.vouchers.get(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }
    const { title, description, discountValue, minOrderAmount, maxDiscount, usageLimit, isActive } = req.body;
    if (title) voucher.title = title;
    if (description !== undefined) voucher.description = description;
    if (discountValue !== undefined) voucher.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) voucher.minOrderAmount = Number(minOrderAmount);
    if (maxDiscount !== undefined) voucher.maxDiscount = Number(maxDiscount);
    if (usageLimit !== undefined) voucher.usageLimit = Number(usageLimit);
    if (isActive !== undefined) voucher.isActive = Boolean(isActive);

    try {
      await executeQuery(
        `UPDATE vouchers SET title = ?, description = ?, discount_value = ?, min_order_amount = ?, max_discount = ?, usage_limit = ?, is_active = ? WHERE id = ?`,
        [
          voucher.title,
          voucher.description,
          voucher.discountValue,
          voucher.minOrderAmount,
          voucher.maxDiscount || null,
          voucher.usageLimit,
          voucher.isActive ? 1 : 0,
          voucher.id,
        ]
      );
    } catch (dbErr: any) {
      console.warn('[StaffController updatePromotion MySQL notice]:', dbErr.message);
    }
    await redisService.delPrefix('vouchers');

    return res.json({
      success: true,
      message: `Đã cập nhật mã "${voucher.code}"`,
      data: typeof (voucher as any)?.toJSON === 'function' ? (voucher as any).toJSON() : voucher,
    });
  }

  public async deletePromotion(req: Request, res: Response) {
    const ok = db.vouchers.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }

    try {
      await executeQuery('DELETE FROM vouchers WHERE id = ?', [req.params.id]);
    } catch (dbErr: any) {
      console.warn('[StaffController deletePromotion MySQL notice]:', dbErr.message);
    }
    await redisService.delPrefix('vouchers');

    return res.json({ success: true, message: 'Đã xóa mã khuyến mãi thành công' });
  }

  /**
   * 10. Đánh giá (Reviews)
   */
  public getReviews(req: Request, res: Response) {
    const { rating, canteenId } = req.query;
    let list = Array.from(db.reviews.values());

    if (rating && rating !== 'ALL') {
      const r = Number(rating);
      list = list.filter((rev) => rev.rating === r);
    }

    const enriched = list.map((rev) => {
      const json = rev.toJSON();
      const product = db.products.get(rev.targetId);
      return {
        ...json,
        productName: product ? product.name : 'Món ăn',
        productImage: product ? product.image : '',
      };
    });

    return res.json({ success: true, total: enriched.length, data: enriched });
  }

  public replyReview(req: Request, res: Response) {
    const rev = db.reviews.get(req.params.id);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
    }
    const { replyText } = req.body;
    (rev as any).reply = replyText;
    (rev as any).repliedAt = new Date().toISOString();
    return res.json({ success: true, message: 'Đã gửi phản hồi đánh giá', data: rev.toJSON() });
  }

  /**
   * 11. Báo cáo Thống kê chuyên sâu (Statistics)
   */
  public async getStatistics(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const orders = await this.getCanteenOrders(canteenId);

      // Group revenue and order count by day (last 7 days)
      const daysMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        daysMap[key] = { date: key, revenue: 0, ordersCount: 0 };
      }

      // Method breakdown
      const methodBreakdown = {
        DINE_IN: { count: 0, revenue: 0 },
        TAKEAWAY: { count: 0, revenue: 0 },
        DELIVERY: { count: 0, revenue: 0 },
      };

      // Product sales ranking
      const productSales: Record<string, { id: string; name: string; image: string; quantity: number; revenue: number }> = {};

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
          if (methodBreakdown[m]) {
            methodBreakdown[m].count += 1;
            methodBreakdown[m].revenue += o.finalAmount;
          }

          o.orderDetails.forEach((d) => {
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
}

export const staffController = new StaffController();
