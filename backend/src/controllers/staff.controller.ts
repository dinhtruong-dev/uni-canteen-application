import { Request, Response } from 'express';
import { db } from '../services/database.service';
import { orderService } from '../services/order.service';
import { socketService } from '../services/socket.service';
import { Order, OrderStatus, OrderType, DiningTable, PickupSlot, Category, Product, Voucher, Review } from '../models';

export class StaffController {
  /**
   * Helper to filter orders for a canteen
   */
  private getCanteenOrders(canteenId?: string): Order[] {
    const all = Array.from(db.orders.values());
    if (!canteenId || canteenId === 'ALL') {
      return all;
    }
    return all.filter((o) => o.canteenId === canteenId);
  }

  /**
   * 1. Dashboard Summary: KPIs, Recent Orders, Quick Stats
   */
  public getDashboard(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const orders = this.getCanteenOrders(canteenId);

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
        const json = o.toJSON();
        const elapsedMinutes = Math.max(0, Math.floor((Date.now() - o.createdAt.getTime()) / 60000));
        return { ...json, elapsedMinutes };
      });

      const canteen = db.canteens.get(canteenId);

      return res.json({
        success: true,
        data: {
          canteen: canteen ? canteen.toJSON() : null,
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
  public getOrders(req: Request, res: Response) {
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

      let list = this.getCanteenOrders(canteenId as string);

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
        const json = o.toJSON();
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
   * 3. Chuyển trạng thái đơn hàng theo luồng chuẩn
   */
  public updateOrderStatus(req: Request, res: Response) {
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
        order.cancel();
        if (reason) {
          order.notes = order.notes ? `${order.notes} [Lý do hủy: ${reason}]` : `Lý do hủy: ${reason}`;
        }
        if (order.tableId) {
          const tbl = db.tables.get(order.tableId);
          if (tbl) tbl.release();
        }
        // Emit Socket event to Customer and KDS
        socketService.emitOrderStatus(order.userId, order.toJSON());
        return res.json({
          success: true,
          message: `Đã hủy đơn hàng #${order.orderCode} thành công`,
          data: order.toJSON(),
        });
      }

      // Transition validation based on receiveMethod
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY'],
        READY: order.orderType === 'TAKEAWAY' ? ['WAITING_PICKUP', 'COMPLETED'] : order.orderType === 'DELIVERY' ? ['DELIVERING', 'COMPLETED'] : ['COMPLETED'],
        WAITING_PICKUP: ['COMPLETED'],
        DELIVERING: ['COMPLETED'],
        COMPLETED: [],
      };

      const allowed = validTransitions[currentStatus] || [];
      if (!allowed.includes(targetStatus)) {
        return res.status(400).json({
          success: false,
          message: `Chuyển trạng thái không hợp lệ: không thể chuyển từ ${currentStatus} sang ${targetStatus}`,
        });
      }

      order.updateStatus(targetStatus as OrderStatus);

      // Release table if completed
      if (targetStatus === 'COMPLETED' && order.tableId) {
        const tbl = db.tables.get(order.tableId);
        if (tbl) tbl.release();
      }

      // Emit Socket event to Customer, Staff, and KDS
      socketService.emitOrderStatus(order.userId, order.toJSON());

      return res.json({
        success: true,
        message: `Đơn hàng #${order.orderCode} đã cập nhật sang trạng thái ${targetStatus}`,
        data: order.toJSON(),
      });
    } catch (err: any) {
      console.error('[StaffController updateOrderStatus Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng' });
    }
  }

  /**
   * 4. Quét QR / Xác nhận mã lấy món (PICKUP verification)
   */
  public verifyPickup(req: Request, res: Response) {
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

      // Update to COMPLETED
      order.updateStatus('COMPLETED');
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
   * 6. Quản lý Bàn & QR
   */
  public getTables(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    let tables = Array.from(db.tables.values());
    if (canteenId && canteenId !== 'ALL') {
      tables = tables.filter((t) => t.canteenId === canteenId);
    }
    return res.json({ success: true, total: tables.length, data: tables.map((t) => t.toJSON()) });
  }

  public createTable(req: Request, res: Response) {
    try {
      const { tableNumber, canteenId = 'cant-a', capacity = 4, area = 'Khu vực chính' } = req.body;
      if (!tableNumber) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên/số bàn (VD: Bàn 09)' });
      }
      const id = `tbl-${Date.now()}`;
      const canteen = db.canteens.get(canteenId);
      const canteenName = canteen ? canteen.name : 'Căng tin A2';
      const cleanNumber = tableNumber.replace(/\s+/g, '_').toUpperCase();
      const qrData = `UNIEAT_TABLE_${canteenId.toUpperCase()}_${cleanNumber}`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

      const newTable = new DiningTable(id, tableNumber, canteenId, canteenName, qrCode, Number(capacity) || 4, area, 'AVAILABLE');
      db.tables.set(newTable.id, newTable);
      return res.status(201).json({ success: true, message: 'Đã tạo bàn ăn & mã QR mới', data: newTable.toJSON() });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo bàn ăn mới' });
    }
  }

  public updateTable(req: Request, res: Response) {
    const table = db.tables.get(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
    }
    const { tableNumber, capacity, area, status } = req.body;
    if (tableNumber) table.tableNumber = tableNumber;
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (area) table.area = area;
    if (status) table.status = status;
    table.updatedAt = new Date();

    return res.json({ success: true, message: 'Đã cập nhật thông tin bàn ăn', data: table.toJSON() });
  }

  public deleteTable(req: Request, res: Response) {
    const ok = db.tables.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
    }
    return res.json({ success: true, message: 'Đã xóa bàn ăn thành công' });
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

  public createFood(req: Request, res: Response) {
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

      const id = `prod-${Date.now()}`;
      const defaultImg =
        image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

      const prod = new Product(
        id,
        name,
        Number(price),
        categoryId,
        canteenId,
        defaultImg,
        5.0,
        0,
        Number(preparationTime) || 10,
        Boolean(isAvailable),
        {
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          description: description || '',
          calories: Number(calories) || 500,
        }
      );

      db.products.set(prod.id, prod);
      return res.status(201).json({ success: true, message: `Đã thêm món "${prod.name}" vào menu`, data: prod.toJSON() });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi thêm món ăn mới' });
    }
  }

  public updateFood(req: Request, res: Response) {
    const prod = db.products.get(req.params.id);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
    }

    const { name, price, originalPrice, categoryId, image, description, preparationTime, calories, isAvailable } = req.body;
    if (name) prod.name = name;
    if (price !== undefined) prod.price = Number(price);
    if (originalPrice !== undefined) prod.originalPrice = Number(originalPrice);
    if (categoryId) prod.categoryId = categoryId;
    if (image) prod.image = image;
    if (description !== undefined) prod.description = description;
    if (preparationTime !== undefined) prod.preparationTime = Number(preparationTime);
    if (calories !== undefined) prod.calories = Number(calories);
    if (isAvailable !== undefined) prod.isAvailable = Boolean(isAvailable);

    return res.json({ success: true, message: `Đã cập nhật món "${prod.name}"`, data: prod.toJSON() });
  }

  public deleteFood(req: Request, res: Response) {
    const prod = db.products.get(req.params.id);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
    }
    db.products.delete(req.params.id);
    return res.json({ success: true, message: `Đã xóa món "${prod.name}" khỏi thực đơn` });
  }

  /**
   * 8. Quản lý Danh mục (Categories)
   */
  public getCategories(_req: Request, res: Response) {
    const list = Array.from(db.categories.values()).sort((a, b) => a.displayOrder - b.displayOrder);
    const enriched = list.map((cat) => {
      const foodCount = Array.from(db.products.values()).filter((p) => p.categoryId === cat.id).length;
      return {
        ...cat.toJSON(),
        foodCount,
      };
    });
    return res.json({ success: true, total: enriched.length, data: enriched });
  }

  public createCategory(req: Request, res: Response) {
    try {
      const { name, description, icon = 'Utensils', image, displayOrder } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên danh mục' });
      }
      const id = `cat-${Date.now()}`;
      const order = displayOrder !== undefined ? Number(displayOrder) : db.categories.size + 1;
      const cat = new Category(id, name, icon, image || 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', order, description || '');
      db.categories.set(cat.id, cat);
      return res.status(201).json({ success: true, message: `Đã tạo danh mục "${cat.name}"`, data: cat.toJSON() });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo danh mục' });
    }
  }

  public updateCategory(req: Request, res: Response) {
    const cat = db.categories.get(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    const { name, description, icon, image, displayOrder } = req.body;
    if (name) cat.name = name;
    if (description !== undefined) cat.description = description;
    if (icon) cat.icon = icon;
    if (image) cat.image = image;
    if (displayOrder !== undefined) cat.displayOrder = Number(displayOrder);

    return res.json({ success: true, message: `Đã cập nhật danh mục "${cat.name}"`, data: cat.toJSON() });
  }

  public deleteCategory(req: Request, res: Response) {
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
    return res.json({ success: true, message: `Đã xóa danh mục "${cat.name}"` });
  }

  /**
   * 9. Quản lý Khuyến mãi (Vouchers / Promotions)
   */
  public getPromotions(_req: Request, res: Response) {
    const list = Array.from(db.vouchers.values()).map((v) => v.toJSON());
    return res.json({ success: true, total: list.length, data: list });
  }

  public createPromotion(req: Request, res: Response) {
    try {
      const { code, title, description, discountType, discountValue, minOrderAmount = 0, maxDiscount, usageLimit = 500 } = req.body;
      if (!code || !title || discountValue === undefined) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Mã code, Tiêu đề và Giá trị giảm' });
      }
      const id = `vouch-${Date.now()}`;
      const voucher = new Voucher(
        id,
        code,
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
      return res.status(201).json({ success: true, message: `Đã tạo mã khuyến mãi "${voucher.code}"`, data: voucher.toJSON() });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo mã khuyến mãi' });
    }
  }

  public updatePromotion(req: Request, res: Response) {
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

    return res.json({ success: true, message: `Đã cập nhật mã "${voucher.code}"`, data: voucher.toJSON() });
  }

  public deletePromotion(req: Request, res: Response) {
    const ok = db.vouchers.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }
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
  public getStatistics(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const orders = this.getCanteenOrders(canteenId);

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
