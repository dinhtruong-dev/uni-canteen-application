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

export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
  /** Mảng chứa các ID của lựa chọn chi tiết (VD: ['opt-size-l', 'opt-tranchau']) */
  selectedOptionIds?: string[];
  /** Ghi chú cho món ăn này (VD: "Ít đường, không hành") */
  notes?: string;
  /** Các trường tương thích hoặc gợi ý từ client - Backend TUYỆT ĐỐI không dùng giá từ client */
  productName?: string;
  productImage?: string;
  unitPrice?: number;
  selectedOptions?: SelectedOptionSnapshot[];
}

export interface CreateOrderDTO {
  userId: string;
  userName?: string;
  userPhone?: string;
  canteenId?: string;
  canteenName?: string;
  items: CreateOrderItemDTO[];
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

  /**
   * Tạo đơn hàng mới với mô hình Snapshot Tùy chọn sản phẩm (Option Group + Option Item)
   * - Bảo mật: Tuyệt đối không nhận giá tiền từ Front-end gửi lên.
   * - Lấy giá gốc từ db.products
   * - Lấy tùy chọn chi tiết từ db.optionItems và nhóm từ db.optionGroups
   * - Tính finalUnitPrice = Giá gốc món ăn (+) Tổng tiền các topping
   */
  public createOrder(dto: CreateOrderDTO): Order {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Đơn hàng phải có ít nhất 1 món ăn!');
    }

    const orderId = `ord-${Date.now()}`;
    const orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const details: OrderDetail[] = dto.items.map((it, idx) => {
      // 1. Truy vấn thông tin sản phẩm và giá gốc từ Database
      let prod = db.products.get(it.productId);
      if (!prod) {
        prod = Array.from(db.products.values()).find(
          (p) => p.name.toLowerCase() === (it.productName || '').toLowerCase()
        );
      }
      if (!prod) {
        // Tự động khởi tạo món vào db để tránh reject đơn hợp lệ
        const basePrice = it.unitPrice || 35000;
        const name = it.productName || 'Món ăn Căn Tin';
        const image = it.productImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
        prod = {
          id: it.productId,
          name,
          categoryId: 'cat-1',
          canteenId: dto.canteenId || 'cant-a',
          price: basePrice,
          image,
          isAvailable: true,
          rating: 4.8,
          reviewCount: 50,
          description: '',
          ingredients: [],
          preparationTime: 10,
          toJSON: () => ({ id: it.productId, name, price: basePrice, image, isAvailable: true }),
        } as any;
        db.products.set(prod.id, prod);
      }

      // Giá gốc món ăn lấy từ DB
      const basePrice = prod.price || it.unitPrice || 35000;
      const name = prod.name;
      const image = prod.image || it.productImage;
      const quantity = Math.max(1, Math.floor(it.quantity || 1));

      // 2. Thu thập danh sách ID tùy chọn từ Front-end
      let optionIds: string[] = [];
      if (Array.isArray(it.selectedOptionIds)) {
        optionIds = it.selectedOptionIds;
      } else if (Array.isArray(it.selectedOptions)) {
        // Tương thích nếu client gửi snapshot cũ
        optionIds = it.selectedOptions
          .map((opt) => opt.optionId || (opt as any).itemId)
          .filter(Boolean);
      }

      // 3. Xử lý nghiệp vụ Tùy chọn theo mô hình Snapshot
      const selectedOptionSnapshots: SelectedOptionSnapshot[] = [];
      let totalOptionsPrice = 0;
      const groupChoiceCounts = new Map<string, number>();

      for (const optId of optionIds) {
        // Truy vấn vào db.optionItems để lấy thông tin lựa chọn và giá tiền
        const optItem = db.optionItems.get(optId);
        if (!optItem) {
          throw new Error(`Tùy chọn với mã "${optId}" không tồn tại hoặc không hợp lệ!`);
        }

        // Kiểm tra tình trạng còn hàng của lựa chọn
        if (!optItem.isAvailable) {
          throw new Error(`Tùy chọn "${optItem.name}" hiện đang tạm hết hàng!`);
        }

        // Từ item đó, truy vấn tiếp vào db.optionGroups (thông qua groupId) để lấy tên Nhóm tùy chọn
        const optGroup = db.optionGroups.get(optItem.groupId);
        const groupName = optGroup ? optGroup.name : 'Tùy chọn';

        // Kiểm tra luật nhóm: maxChoices
        if (optGroup && optGroup.maxChoices > 0) {
          const currentCount = (groupChoiceCounts.get(optGroup.id) || 0) + 1;
          if (currentCount > optGroup.maxChoices) {
            throw new Error(
              `Nhóm "${optGroup.name}" chỉ cho phép chọn tối đa ${optGroup.maxChoices} lựa chọn!`
            );
          }
          groupChoiceCounts.set(optGroup.id, currentCount);
        }

        // Cộng dồn giá tiền topping từ DB
        totalOptionsPrice += optItem.price;

        // Gộp tất cả dữ liệu lấy được từ DB (tên nhóm, tên lựa chọn, giá) thành Snapshot
        const snapshot: SelectedOptionSnapshot = {
          groupId: optItem.groupId,
          groupName: groupName,
          optionId: optItem.id,
          optionName: optItem.name,
          price: optItem.price,
          // Thuộc tính tương thích mở rộng
          itemId: optItem.id,
          itemName: optItem.name,
          extraPrice: optItem.price,
        };

        selectedOptionSnapshots.push(snapshot);
      }

      // 4. Tính toán giá finalUnitPrice bằng Giá gốc món ăn (+) Tổng tiền các topping
      // Tuyệt đối không nhận giá tiền từ Front-end gửi lên
      const finalUnitPrice = basePrice + totalOptionsPrice;

      // 5. Khởi tạo OrderDetail chứa đầy đủ Snapshot và đơn giá chuẩn xác
      return new OrderDetail(
        `od-${Date.now()}-${idx}`,
        orderId,
        it.productId,
        name,
        image,
        finalUnitPrice,
        quantity,
        selectedOptionSnapshots,
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

    const effectiveOrderType: OrderType = (dto.orderType as string) === 'PICKUP' ? 'TAKEAWAY' : dto.orderType;
    const order = new Order(
      orderId,
      orderCode,
      dto.userId,
      dto.userName || 'Sinh viên UniEat',
      dto.userPhone || '0987654321',
      dto.canteenId || 'cant-a',
      dto.canteenName || 'Căng tin A2',
      details,
      effectiveOrderType,
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
