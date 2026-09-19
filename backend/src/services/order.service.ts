import { db } from './database.service';
import {
  Order,
  OrderDetail,
  OrderStatus,
  OrderType,
  PaymentMethod,
  SelectedOptionSnapshot,
} from '../models';
import { realtimeService } from './realtime.service';
import { socketService } from './socket.service';

export interface CreateOrderDTO {
  userId: string;
  userName?: string;
  userPhone?: string;
  canteenId?: string;
  canteenName?: string;
  items: Array<{
    productId: string;
    productName?: string;
    productImage?: string;
    unitPrice?: number;
    quantity: number;
    selectedOptions?: SelectedOptionSnapshot[];
    notes?: string;
  }>;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  tableId?: string;
  tableNumber?: string;
  pickupSlot?: string;
  deliveryAddressId?: string;
  deliveryAddressText?: string;
  notes?: string;
}

export class OrderService {
  public getAllOrders(userId?: string): Order[] {
    const list = Array.from(db.orders.values());
    if (userId) {
      return list.filter((o) => o.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getOrderById(orderId: string): Order | undefined {
    return (
      db.orders.get(orderId) ||
      Array.from(db.orders.values()).find((o) => o.orderCode === orderId)
    );
  }

  public createOrder(dto: CreateOrderDTO): Order {
    const orderId = `ord-${Date.now()}`;
    const orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const details: OrderDetail[] = dto.items.map((it, idx) => {
      const prod = db.products.get(it.productId);
      const name = it.productName || prod?.name || 'Món ăn';
      const image = it.productImage || prod?.image || '';
      const price = it.unitPrice || prod?.price || 0;

      return new OrderDetail(
        `od-${Date.now()}-${idx}`,
        orderId,
        it.productId,
        name,
        image,
        price,
        it.quantity,
        it.selectedOptions || [],
        it.notes
      );
    });

    // Calculate discount if voucher provided
    let discountAmount = 0;
    if (dto.voucherCode) {
      const voucher = Array.from(db.vouchers.values()).find(
        (v) => v.code === dto.voucherCode!.toUpperCase().trim()
      );
      if (voucher) {
        const subtotal = details.reduce((sum, d) => sum + d.itemSubtotal, 0);
        if (voucher.isValid(subtotal).valid) {
          discountAmount = voucher.calculateDiscount(subtotal);
          voucher.claim();
        }
      }
    }

    const order = new Order(
      orderId,
      orderCode,
      dto.userId,
      dto.userName || 'Sinh viên UniEat',
      dto.userPhone || '0987654321',
      dto.canteenId || 'cant-a',
      dto.canteenName || 'Căng tin A2',
      details,
      dto.orderType,
      dto.paymentMethod,
      {
        discountAmount,
        tableId: dto.tableId,
        tableNumber: dto.tableNumber,
        pickupSlot: dto.pickupSlot,
        deliveryAddressId: dto.deliveryAddressId,
        deliveryAddressText: dto.deliveryAddressText,
        notes: dto.notes,
        status: 'PENDING',
        isPaid: dto.paymentMethod !== 'CASH',
      }
    );

    // If dining table, mark table occupied
    if (dto.tableId) {
      const table = db.tables.get(dto.tableId);
      if (table) table.occupy(order.id);
    }

    // Save to DB
    db.orders.set(order.id, order);

    // Broadcast real-time order update via SSE and Socket.IO
    realtimeService.sendToUser(order.userId, 'order:created', order.toJSON());
    realtimeService.broadcast('canteen:new_order', { orderId: order.id, code: order.orderCode });

    // Socket.IO emission to Staff and Student
    socketService.emitNewOrder(order.toJSON());
    socketService.emitOrderStatus(order.userId, order.toJSON());

    return order;
  }

  public updateStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.updateStatus(status);

    // If completed or cancelled, release dining table if linked
    if ((status === 'COMPLETED' || status === 'CANCELLED') && order.tableId) {
      const table = db.tables.get(order.tableId);
      if (table && table.currentOrderId === order.id) {
        table.release();
      }
    }

    // Real-time notify user via SSE and Socket.IO
    realtimeService.sendToUser(order.userId, 'order:status_changed', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
    });
    socketService.emitOrderStatus(order.userId, order.toJSON());

    return order;
  }

  public cancelOrder(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order) return false;
    const ok = order.cancel();
    if (ok && order.tableId) {
      const table = db.tables.get(order.tableId);
      if (table) table.release();
    }
    return ok;
  }
}

export const orderService = new OrderService();
