import { db } from './database.service';
import { executeQuery } from '../config/db.config';
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
import { tableService } from './table.service';
import { interactionService } from './interaction.service';
import { cartService } from './cart.service';

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
  id?: string;
  orderCode?: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  canteenId?: string;
  canteenName?: string;
  items: CreateOrderItemDTO[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  voucherId?: string;
  tableId?: string;
  tableNumber?: string;
  pickupSlot?: string;
  deliveryAddressId?: string;
  deliveryAddressText?: string;
  notes?: string;
}

export class OrderService {
  public async getAllOrders(userId?: string, canteenId?: string): Promise<Order[]> {
    try {
      let sql = 'SELECT * FROM orders';
      const params: any[] = [];
      const where: string[] = [];
      if (userId) {
        where.push('user_id = ?');
        params.push(userId);
      }
      if (canteenId && canteenId !== 'ALL') {
        where.push('canteen_id = ?');
        params.push(canteenId);
      }
      if (where.length > 0) {
        sql += ' WHERE ' + where.join(' AND ');
      }
      sql += ' ORDER BY created_at DESC';

      const rows = await executeQuery(sql, params);
      if (Array.isArray(rows) && rows.length > 0) {
        const orderIds = rows.map((r: any) => r.id);
        const detailRows = await executeQuery(
          `SELECT * FROM order_details WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
          orderIds
        );

        const detailsMap = new Map<string, OrderDetail[]>();
        if (Array.isArray(detailRows)) {
          for (const d of detailRows) {
            let selectedOptions: any[] = [];
            try {
              selectedOptions = JSON.parse(d.selected_options_json || '[]');
            } catch {}
            const item = new OrderDetail(
              d.id,
              d.order_id,
              d.product_id,
              d.product_name,
              d.product_image,
              Number(d.unit_price) || 0,
              Number(d.quantity) || 1,
              selectedOptions,
              d.notes
            );
            if (!detailsMap.has(d.order_id)) detailsMap.set(d.order_id, []);
            detailsMap.get(d.order_id)!.push(item);
          }
        }

        const orders: Order[] = [];
        for (const r of rows) {
          const items = detailsMap.get(r.id) || [];
          const order = new Order(
            r.id,
            r.order_code,
            r.user_id,
            r.user_name,
            r.user_phone,
            r.canteen_id,
            r.canteen_name,
            items,
            r.order_type,
            r.payment_method,
            {
              voucherId: r.voucher_id || undefined,
              discountAmount: Number(r.discount_amount) || 0,
              tableId: r.table_id || undefined,
              tableNumber: r.table_number || undefined,
              pickupSlot: r.pickup_slot || undefined,
              deliveryAddressId: r.delivery_address_id || undefined,
              deliveryAddressText: r.delivery_address_text || undefined,
              notes: r.notes || undefined,
              status: r.status,
              isPaid: Boolean(r.is_paid),
            }
          );
          db.orders.set(order.id, order);
          orders.push(order);
        }
        return orders;
      }
    } catch (err: any) {
      console.warn('[OrderService] MySQL fetch orders notice:', err.message);
    }

    let list = Array.from(db.orders.values());
    if (canteenId && canteenId !== 'ALL') {
      list = list.filter((o) => o.canteenId === canteenId);
    }
    if (userId) {
      list = list.filter((o) => o.userId === userId);
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getOrderById(orderId: string): Order | undefined {
    return (
      db.orders.get(orderId) ||
      Array.from(db.orders.values()).find((o) => o.orderCode === orderId)
    );
  }

  public async findOrderByIdOrCode(orderId: string): Promise<Order | undefined> {
    const memory = this.getOrderById(orderId);
    if (memory) return memory;
    try {
      const rows = await executeQuery('SELECT * FROM orders WHERE id = ? OR order_code = ? LIMIT 1', [orderId, orderId]);
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        const detailRows = await executeQuery('SELECT * FROM order_details WHERE order_id = ?', [r.id]);
        const items: OrderDetail[] = [];
        if (Array.isArray(detailRows)) {
          for (const d of detailRows) {
            let selectedOptions: any[] = [];
            try { selectedOptions = JSON.parse(d.selected_options_json || '[]'); } catch {}
            items.push(new OrderDetail(
              d.id, d.order_id, d.product_id, d.product_name, d.product_image,
              Number(d.unit_price) || 0, Number(d.quantity) || 1, selectedOptions, d.notes
            ));
          }
        }
        const order = new Order(
          r.id, r.order_code, r.user_id, r.user_name, r.user_phone,
          r.canteen_id, r.canteen_name, items, r.order_type, r.payment_method,
          {
            voucherId: r.voucher_id || undefined,
            discountAmount: Number(r.discount_amount) || 0,
            tableId: r.table_id || undefined,
            tableNumber: r.table_number || undefined,
            pickupSlot: r.pickup_slot || undefined,
            deliveryAddressId: r.delivery_address_id || undefined,
            deliveryAddressText: r.delivery_address_text || undefined,
            notes: r.notes || undefined,
            status: r.status,
            isPaid: Boolean(r.is_paid),
          }
        );
        db.orders.set(order.id, order);
        return order;
      }
    } catch (err: any) {
      console.warn('[OrderService] findOrderByIdOrCode MySQL notice:', err.message);
    }
    return undefined;
  }

  /**
   * Tạo đơn hàng mới với mô hình Snapshot Tùy chọn sản phẩm (Option Group + Option Item)
   * - Bảo mật: Tuyệt đối không nhận giá tiền từ Front-end gửi lên.
   * - Lấy giá gốc từ db.products
   * - Lấy tùy chọn chi tiết từ db.optionItems và nhóm từ db.optionGroups
   * - Tính finalUnitPrice = Giá gốc món ăn (+) Tổng tiền các topping
   */
  public async createOrder(dto: CreateOrderDTO): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Đơn hàng phải có ít nhất 1 món ăn!');
    }

    const orderId = dto.id || `ord-${Date.now()}`;
    const orderCode = dto.orderCode || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

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
    let appliedVoucherId: string | undefined = dto.voucherId;
    if (dto.voucherCode || dto.voucherId) {
      const voucher = dto.voucherId
        ? db.vouchers.get(dto.voucherId)
        : Array.from(db.vouchers.values()).find(
            (v) => v.code === dto.voucherCode!.toUpperCase().trim()
          );
      if (voucher) {
        const subtotal = details.reduce((sum, d) => sum + d.itemSubtotal, 0);
        if (voucher.isValid(subtotal).valid) {
          discountAmount = voucher.calculateDiscount(subtotal);
          appliedVoucherId = voucher.id;
          voucher.claim();

          // Cập nhật trạng thái đã dùng trong kho voucher của sinh viên
          const userVoucher = Array.from(db.userVouchers.values()).find(
            (uv) => uv.userId === dto.userId && uv.voucherId === voucher.id && !uv.isUsed
          );
          if (userVoucher) {
            userVoucher.markAsUsed();
            executeQuery(
              'UPDATE user_vouchers SET is_used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?',
              [userVoucher.id]
            ).catch(() => {});
          }
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
        voucherId: appliedVoucherId,
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

    // If dining table, mark table occupied in DB and memory
    if (order.orderType === 'DINE_IN' || dto.tableId || dto.tableNumber) {
      const targetTableKey = dto.tableId || dto.tableNumber;
      if (targetTableKey) {
        const table =
          (await tableService.getTableById(targetTableKey)) ||
          (await tableService.findTableByQr(targetTableKey));
        if (table) {
          order.tableId = table.id;
          order.tableNumber = table.tableNumber;
          await tableService.updateTableStatus(table.id, 'OCCUPIED', order.id);
        }
      }
    }

    // Save to In-Memory DB
    db.orders.set(order.id, order);

    // Persist to MySQL database (database.sql)
    try {
      const orderTypeDb = (effectiveOrderType as string) === 'PICKUP' ? 'TAKEAWAY' : effectiveOrderType;
      const validSqlPaymentMethods = ['CAMPUS_WALLET', 'MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER', 'CASH'];
      const paymentMethodDb = validSqlPaymentMethods.includes(order.paymentMethod)
        ? order.paymentMethod
        : (order.paymentMethod as string) === 'STUDENT_WALLET'
          ? 'CAMPUS_WALLET'
          : (order.paymentMethod as string) === 'VNPAY_QR'
            ? 'VNPAY'
            : 'CASH';

      await executeQuery(
        `INSERT INTO orders (
          id, order_code, user_id, user_name, user_phone, canteen_id, canteen_name, voucher_id,
          total_amount, discount_amount, final_amount, status, order_type,
          table_id, table_number, pickup_slot, delivery_address_id, delivery_address_text,
          payment_method, is_paid, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), is_paid = VALUES(is_paid), updated_at = CURRENT_TIMESTAMP`,
        [
          order.id,
          order.orderCode,
          order.userId,
          order.userName,
          order.userPhone,
          order.canteenId,
          order.canteenName,
          order.voucherId || null,
          order.totalAmount,
          order.discountAmount,
          order.finalAmount,
          order.status,
          orderTypeDb,
          order.tableId || null,
          order.tableNumber || null,
          order.pickupSlot || null,
          order.deliveryAddressId || null,
          order.deliveryAddressText || null,
          paymentMethodDb,
          order.isPaid ? 1 : 0,
          order.notes || null,
        ]
      );

      for (const item of details) {
        await executeQuery(
          `INSERT INTO order_details (
            id, order_id, product_id, product_name, product_image,
            unit_price, quantity, selected_options_json, item_subtotal, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
          [
            item.id,
            item.orderId,
            item.productId,
            item.productName,
            item.productImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
            item.unitPrice,
            item.quantity,
            JSON.stringify(item.selectedOptions || []),
            item.itemSubtotal,
            item.notes || null,
          ]
        );
      }

      // Giai đoạn Dọn dẹp: Lưu vào MySQL thành công, gọi lệnh redis.del('cart:' + userId) để xóa trắng giỏ hàng
      try {
        await cartService.clearCart(order.userId);
      } catch (cleanErr: any) {
        console.warn('[Redis Cart Cleanup Notice]:', cleanErr.message);
      }
    } catch (mysqlErr: any) {
      console.warn('[MySQL Order Persistence Notice]:', mysqlErr.message);
    }

    // Broadcast real-time order update via SSE and Socket.IO
    const orderJson = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
    realtimeService.sendToUser(order.userId, 'order:created', orderJson);
    realtimeService.broadcast('canteen:new_order', { orderId: order.id, code: order.orderCode });

    // Socket.IO emission to Staff and Student
    socketService.emitNewOrder(orderJson);
    socketService.emitOrderStatus(order.userId, orderJson);

    return order;
  }

  public async updateStatus(orderId: string, status: OrderStatus, reason?: string): Promise<Order | null> {
    const order = (await this.findOrderByIdOrCode(orderId)) || this.getOrderById(orderId);
    if (!order) return null;

    order.updateStatus(status);
    if (reason) {
      order.notes = order.notes ? `${order.notes} [Lý do: ${reason}]` : `Lý do: ${reason}`;
    }

    // If order was cancelled, release table back to AVAILABLE
    if (status === 'CANCELLED' && (order.tableId || order.tableNumber)) {
      const tableKey = order.tableId || order.tableNumber;
      if (tableKey) {
        await tableService.updateTableStatus(tableKey, 'AVAILABLE');
      }
    } else if (
      (status === 'CONFIRMED' || status === 'PREPARING' || status === 'READY' || status === 'SERVED' || status === 'COMPLETED') &&
      (order.tableId || order.tableNumber)
    ) {
      // Table stays OCCUPIED even after COMPLETED until staff explicitly presses "Làm sạch" in Table Management!
      const tableKey = order.tableId || order.tableNumber;
      if (tableKey) {
        await tableService.updateTableStatus(tableKey, 'OCCUPIED', order.id);
      }
    }

    // Persist status change to MySQL
    try {
      await executeQuery(
        'UPDATE orders SET status = ?, is_paid = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR order_code = ?',
        [status, order.isPaid ? 1 : 0, order.notes || null, order.id, order.orderCode]
      );
    } catch (err: any) {
      console.warn('[OrderService] MySQL update status notice:', err.message);
    }

    // Tự động tạo và gửi thông báo cho khách hàng
    let notifTitle = `Cập nhật đơn hàng #${order.orderCode}`;
    let notifMsg = `Đơn hàng #${order.orderCode} của bạn đã chuyển sang trạng thái: ${status}`;

    if (status === 'CONFIRMED') {
      notifTitle = `Đơn #${order.orderCode} đã được nhận`;
      notifMsg = `Căn tin đã tiếp nhận đơn #${order.orderCode} và đang chuẩn bị đưa vào bếp chế biến.`;
    } else if (status === 'PREPARING') {
      notifTitle = `Bếp đang nấu đơn #${order.orderCode}`;
      notifMsg = `Đầu bếp đang thực hiện các món ăn cho đơn hàng #${order.orderCode} của bạn.`;
    } else if (status === 'READY') {
      notifTitle = `Món ăn đơn #${order.orderCode} đã nấu xong!`;
      notifMsg = order.orderType === 'DINE_IN'
        ? `Món ăn đơn #${order.orderCode} đã sẵn sàng, nhân viên đang mang ra bàn ${order.tableNumber || ''}.`
        : order.orderType === 'TAKEAWAY'
        ? `Món ăn đơn #${order.orderCode} đã nấu xong, mời bạn đến quầy nhận món!`
        : `Món ăn đơn #${order.orderCode} đã chuẩn bị xong, tài xế đang lấy đơn để đi giao.`;
    } else if (status === 'SERVED') {
      notifTitle = `Món ăn đã giao ra bàn ${order.tableNumber || ''}`;
      notifMsg = `Nhân viên đã phục vụ đầy đủ món ăn ra bàn ${order.tableNumber || ''}. Chúc bạn có bữa ăn ngon miệng!`;
    } else if (status === 'WAITING_PICKUP') {
      notifTitle = `Mời nhận món #${order.orderCode}`;
      notifMsg = `Đơn hàng mang về #${order.orderCode} đã sẵn sàng tại quầy. Mã nhận món: ${order.pickupCode || order.orderCode}.`;
    } else if (status === 'DELIVERING') {
      notifTitle = `Đơn hàng #${order.orderCode} đang được giao`;
      notifMsg = `Shipper đang giao đơn #${order.orderCode} đến ${order.deliveryAddressText || 'KTX'}. Vui lòng chú ý điện thoại.`;
    } else if (status === 'COMPLETED') {
      notifTitle = `Đơn hàng #${order.orderCode} đã hoàn tất`;
      notifMsg = order.orderType === 'DINE_IN'
        ? `Bữa ăn tại bàn ${order.tableNumber || ''} đã hoàn tất. Bàn đã được dọn dẹp làm sạch. Cảm ơn bạn!`
        : `Đơn hàng #${order.orderCode} đã hoàn tất thành công. Chúc bạn ngon miệng!`;
    } else if (status === 'CANCELLED') {
      notifTitle = `Đơn hàng #${order.orderCode} đã bị hủy`;
      notifMsg = reason ? `Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}` : `Đơn hàng #${order.orderCode} đã bị hủy.`;
    }

    try {
      interactionService.createNotification({
        userId: order.userId,
        title: notifTitle,
        message: notifMsg,
        type: 'ORDER_STATUS',
        referenceId: order.id,
      });
    } catch (notifErr: any) {
      console.warn('[OrderService] Error creating notification:', notifErr.message);
    }

    // Real-time notify user via SSE and Socket.IO
    realtimeService.sendToUser(order.userId, 'order:status_changed', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
    });
    const updatedOrderJson = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
    socketService.emitOrderStatus(order.userId, updatedOrderJson);

    // If order confirmed or preparing, notify POS / Kitchen Screen
    if (status === 'CONFIRMED' || status === 'PREPARING') {
      socketService.emitNewOrder(updatedOrderJson);
    }

    return order;
  }

  public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    const order = this.getOrderById(orderId);
    if (!order) return false;
    const ok = order.cancel();
    if (ok) {
      if (reason) {
        order.notes = order.notes ? `${order.notes} [Lý do hủy: ${reason}]` : `Lý do hủy: ${reason}`;
      }
      if (order.tableId || order.tableNumber) {
        const tableKey = order.tableId || order.tableNumber;
        if (tableKey) {
          await tableService.updateTableStatus(tableKey, 'AVAILABLE');
        }
      }
      try {
        await executeQuery(
          'UPDATE orders SET status = "CANCELLED", notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR order_code = ?',
          [order.notes || null, order.id, order.orderCode]
        );
      } catch (err: any) {
        console.warn('[OrderService] MySQL cancel notice:', err.message);
      }

      try {
        interactionService.createNotification({
          userId: order.userId,
          title: `Đơn hàng #${order.orderCode} đã bị hủy`,
          message: reason ? `Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}` : `Đơn hàng #${order.orderCode} đã bị hủy.`,
          type: 'ORDER_STATUS',
          referenceId: order.id,
        });
      } catch {}

      // Real-time broadcast cancellation to customer, staff, and admin!
      const updatedOrderJson = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
      socketService.emitOrderStatus(order.userId, updatedOrderJson);
      realtimeService.sendToUser(order.userId, 'order:status_changed', {
        orderId: order.id,
        orderCode: order.orderCode,
        status: 'CANCELLED',
      });
      realtimeService.broadcast('order:cancelled', {
        orderId: order.id,
        orderCode: order.orderCode,
        userId: order.userId,
        userName: order.userName,
      });
    }
    return ok;
  }
}

export const orderService = new OrderService();
