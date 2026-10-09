import { Response } from 'express';
import { orderService } from '../services/order.service';
import { cartService } from '../services/cart.service';
import { paymentService } from '../services/payment.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class OrderController {
  public async getAllOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.query.all === 'true' ? undefined : req.user?.id || 'user-stu-1';
      const rawOrders = await orderService.getAllOrders(userId);
      const orders = rawOrders.map((o: any) => (typeof o?.toJSON === 'function' ? o.toJSON() : o));
      res.json({ success: true, total: orders.length, data: orders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách đơn hàng', error: err.message });
    }
  }

  public async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }
      const payment = await paymentService.getPaymentByOrderId(order.id);
      const orderData = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
      const paymentData = payment ? (typeof (payment as any)?.toJSON === 'function' ? (payment as any).toJSON() : payment) : null;
      res.json({
        success: true,
        data: {
          ...orderData,
          payment: paymentData,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải chi tiết đơn hàng', error: err.message });
    }
  }

  public async createOrder(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const userCart = await cartService.getOrCreateCart(userId);

    // If items not provided in body, use user's Cart items
    let orderItems = req.body.items;
    if (!orderItems || orderItems.length === 0) {
      if (userCart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
      }
      orderItems = userCart.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage,
        quantity: it.quantity,
        selectedOptionIds: it.selectedOptions.map((o) => o.optionId || (o as any).itemId).filter(Boolean),
        selectedOptions: it.selectedOptions,
        notes: it.notes,
      }));
    }

    try {
      // 1. Create order (persisted to MySQL DB)
      const order = await orderService.createOrder({
        ...req.body,
        userId,
        userName: req.body.userName || req.user?.name,
        items: orderItems,
      });

      // 2. Process Payment
      const payment = await paymentService.processPayment(
        order.id,
        userId,
        order.finalAmount,
        order.paymentMethod
      );

      // If paid successfully, mark order isPaid
      if (payment.status === 'SUCCESS') {
        order.isPaid = true;
      }

      // 3. Clear cart if order placed from cart
      await cartService.clearCart(userId);

      const orderData = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
      const paymentData = typeof (payment as any)?.toJSON === 'function' ? (payment as any).toJSON() : payment;
      res.status(201).json({
        success: true,
        message: 'Đặt đơn hàng thành công!',
        data: {
          order: orderData,
          payment: paymentData,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Lỗi đặt đơn hàng' });
    }
  }

  public async updateStatus(req: AuthenticatedRequest, res: Response) {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    const data = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
    res.json({ success: true, message: 'Cập nhật trạng thái đơn thành công', data });
  }

  public async cancelOrder(req: AuthenticatedRequest, res: Response) {
    const ok = await orderService.cancelOrder(req.params.id);
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng (đơn đã chuẩn bị hoặc đã hoàn thành)',
      });
    }
    const order = await orderService.getOrderById(req.params.id);
    const data = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
    res.json({ success: true, message: 'Đã hủy đơn hàng thành công', data });
  }

  /**
   * KDS (Kitchen Display System): Get all active orders grouped/sorted for kitchen screen
   */
  public async getKDSOrders(req: any, res: Response) {
    try {
      const canteenId = req.query.canteenId as string;
      const allOrders = await orderService.getAllOrders(); // returns all orders

      // KDS / POS bếp chỉ nhận các đơn ĐÃ ĐƯỢC NHÂN VIÊN DUYỆT ('CONFIRMED') hoặc ĐANG NẤU ('PREPARING')
      const activeStatuses = ['CONFIRMED', 'PREPARING'];

      let filtered = allOrders.filter((o) => activeStatuses.includes(o.status));

      if (canteenId && canteenId !== 'ALL') {
        filtered = filtered.filter((o) => o.canteenId === canteenId);
      }

      // Sort FIFO (First In, First Out: oldest first so kitchen cooks in order)
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const now = Date.now();
      const enriched = filtered.map((o) => {
        const json = typeof (o as any)?.toJSON === 'function' ? (o as any).toJSON() : o;
        const elapsedMinutes = Math.max(0, Math.floor((now - new Date(o.createdAt).getTime()) / 60000));
        return {
          ...json,
          elapsedMinutes,
        };
      });

      const allCanteenOrders = canteenId && canteenId !== 'ALL'
        ? allOrders.filter((o) => o.canteenId === canteenId)
        : allOrders;

      const summary = {
        newCount: allCanteenOrders.filter((o) => o.status === 'CONFIRMED').length,
        cookingCount: allCanteenOrders.filter((o) => o.status === 'PREPARING').length,
        readyCount: allCanteenOrders.filter((o) => o.status === 'READY' || o.status === 'WAITING_PICKUP' || o.status === 'DELIVERING').length,
        completedCount: allCanteenOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'READY' || o.status === 'WAITING_PICKUP' || o.status === 'DELIVERING').length,
      };

      return res.json({
        success: true,
        total: enriched.length,
        summary,
        data: enriched,
      });
    } catch (err: any) {
      console.error('[KDS getKDSOrders Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải đơn hàng KDS' });
    }
  }

  /**
   * KDS: Get history of completed orders today
   */
  public async getKDSHistory(req: any, res: Response) {
    try {
      const canteenId = req.query.canteenId as string;
      const allOrders = await orderService.getAllOrders();

      let completed = allOrders.filter((o) => o.status === 'COMPLETED');
      if (canteenId && canteenId !== 'ALL') {
        completed = completed.filter((o) => o.canteenId === canteenId);
      }

      // Sort newest first
      completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const data = completed.slice(0, 50).map((o: any) => (typeof o?.toJSON === 'function' ? o.toJSON() : o));
      return res.json({
        success: true,
        total: data.length,
        data,
      });
    } catch (err: any) {
      console.error('[KDS getKDSHistory Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử đơn KDS' });
    }
  }

  /**
   * KDS / Staff: Call customer to pickup dish / notify customer
   */
  public async callCustomer(req: any, res: Response) {
    try {
      const orderId = req.params.id;
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      // Socket broadcast to customer & counter
      const socket = (global as any).io || require('../socket').socketManager.getIO();
      if (socket) {
        const payload = {
          orderId: order.id,
          orderCode: order.orderCode,
          userName: order.userName,
          orderType: order.orderType,
          tableNumber: order.tableNumber,
          message:
            order.orderType === 'TAKEAWAY'
              ? `Mời khách hàng ${order.userName} (#${order.orderCode}) đến quầy nhận món!`
              : order.orderType === 'DELIVERY'
              ? `Đơn hàng #${order.orderCode} đã chuẩn bị xong và nhân viên đang bắt đầu giao tận phòng KTX!`
              : `Món ăn cho bàn ${order.tableNumber || 'của bạn'} (#${order.orderCode}) đã sẵn sàng!`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        socket.emit('customer:call_order', payload);
        if (order.userId) {
          socket.to(`user:${order.userId}`).emit('customer:call_order', payload);
        }
      }

      return res.json({
        success: true,
        message: `Đã phát thông báo gọi khách cho đơn #${order.orderCode}`,
      });
    } catch (err: any) {
      console.error('[KDS callCustomer Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi phát thông báo gọi khách' });
    }
  }

  /**
   * KDS: Update status directly from touch kitchen screen
   */
  public async updateKDSStatus(req: any, res: Response) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Trạng thái mới không hợp lệ' });
      }

      const order = await orderService.updateStatus(orderId, status);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      return res.json({
        success: true,
        message: `Đơn hàng #${order.orderCode} đã chuyển sang trạng thái ${status}`,
        data: typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order,
      });
    } catch (err: any) {
      console.error('[KDS updateKDSStatus Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái đơn KDS' });
    }
  }
}

export const orderController = new OrderController();
