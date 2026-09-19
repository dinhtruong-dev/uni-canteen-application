import { Response } from 'express';
import { orderService } from '../services/order.service';
import { cartService } from '../services/cart.service';
import { paymentService } from '../services/payment.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class OrderController {
  public getAllOrders(req: AuthenticatedRequest, res: Response) {
    const userId = req.query.all === 'true' ? undefined : req.user?.id || 'user-stu-1';
    const orders = orderService.getAllOrders(userId).map((o) => o.toJSON());
    res.json({ success: true, total: orders.length, data: orders });
  }

  public getOrderById(req: AuthenticatedRequest, res: Response) {
    const order = orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    const payment = paymentService.getPaymentByOrderId(order.id);
    res.json({
      success: true,
      data: {
        ...order.toJSON(),
        payment: payment ? payment.toJSON() : null,
      },
    });
  }

  public createOrder(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const userCart = cartService.getOrCreateCart(userId);

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
        unitPrice: it.getUnitPrice(),
        quantity: it.quantity,
        selectedOptions: it.selectedOptions,
        notes: it.notes,
      }));
    }

    try {
      // 1. Create order
      const order = orderService.createOrder({
        ...req.body,
        userId,
        userName: req.body.userName || req.user?.name,
        items: orderItems,
      });

      // 2. Process Payment
      const payment = paymentService.processPayment(
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
      cartService.clearCart(userId);

      res.status(201).json({
        success: true,
        message: 'Đặt đơn hàng thành công!',
        data: {
          order: order.toJSON(),
          payment: payment.toJSON(),
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Lỗi đặt đơn hàng' });
    }
  }

  public updateStatus(req: AuthenticatedRequest, res: Response) {
    const { status } = req.body;
    const order = orderService.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, message: 'Cập nhật trạng thái đơn thành công', data: order.toJSON() });
  }

  public cancelOrder(req: AuthenticatedRequest, res: Response) {
    const ok = orderService.cancelOrder(req.params.id);
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng (đơn đã chuẩn bị hoặc đã hoàn thành)',
      });
    }
    res.json({ success: true, message: 'Đã hủy đơn hàng thành công' });
  }
}

export const orderController = new OrderController();
