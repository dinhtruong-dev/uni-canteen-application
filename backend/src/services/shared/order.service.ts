// src/services/shared/order.service.ts
import { Op } from 'sequelize';
import sequelize from '../../db/sequelize';
import {
  Order,
  OrderDetail,
  Product,
  Voucher,
  UserVoucher,
  OptionItem,
  OptionGroup,
  DiningTable,
} from '../../models';

import type {
  CreateOrderDTO,
  CreateOrderItemDTO,
  OrderStatus,
  OrderType,
} from '../../types/order.types';

import type { SelectedOptionSnapshot } from '../../types/cart.types';

import { realtimeService } from '../infrastructure/realtime.service';
import { socketService } from '../infrastructure/socket.service';
import { tableService } from './table.service';
import { interactionService } from './interaction.service';
import { cartService } from './cart.service';

/**
 * State machine: chỉ cho phép chuyển trạng thái theo bảng này.
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'WAITING_PICKUP', 'DELIVERING', 'CANCELLED'],
  SERVED: ['COMPLETED'],
  WAITING_PICKUP: ['COMPLETED', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export class OrderService {
  // ---------------------------------------------------------------------------
  // QUERY
  // ---------------------------------------------------------------------------

  public async getAllOrders(userId?: string, canteenId?: string): Promise<Order[]> {
    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (canteenId && canteenId !== 'ALL') whereClause.canteenId = canteenId;

    return Order.findAll({
      where: whereClause,
      include: [OrderDetail],
      order: [['createdAt', 'DESC']],
    });
  }

  public async getOrderById(orderId: string): Promise<Order | undefined> {
    return this.findOrderByIdOrCode(orderId);
  }

  public async findOrderByIdOrCode(orderId: string): Promise<Order | undefined> {
    const cleanCode = orderId.replace('#', '').trim();
    const order = await Order.findOne({
      where: { [Op.or]: [{ id: orderId }, { orderCode: cleanCode }] },
      include: [OrderDetail],
    });
    return order || undefined;
  }

  // ---------------------------------------------------------------------------
  // CREATE ORDER
  // ---------------------------------------------------------------------------

  public async createOrder(dto: CreateOrderDTO): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Đơn hàng phải có ít nhất 1 món ăn!');
    }

    const orderId = dto.id || `ord-${Date.now()}`;
    const orderCode = dto.orderCode || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Load tất cả product 1 lần -> tránh N+1
    const productIds = dto.items.map((i) => i.productId).filter(Boolean);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 2. Build details (chưa ghi DB)
    const detailsToCreate = await this.buildOrderDetails(dto.items, productMap, orderId);

    // 3. Tính subtotal
    const subtotal = detailsToCreate.reduce((s, d) => s + d.itemSubtotal, 0);

    // 4. Xác định orderType hiệu lực
    const effectiveOrderType: OrderType =
      (dto.orderType as string) === 'PICKUP' ? 'TAKEAWAY' : dto.orderType;

    // 5. Xử lý voucher (đọc trước, trừ sau trong transaction)
    const voucherResult = await this.resolveVoucher(dto, subtotal);

    const discountAmount = voucherResult.discountAmount;
    const appliedVoucherId = voucherResult.voucherId;
    const finalAmount = Math.max(0, subtotal - discountAmount);

    // 6. Transaction: tạo Order + OrderDetail + trừ voucher + set bàn
    const created = await sequelize.transaction(async (t) => {
      // 6a. Nếu DINE_IN, khoá bàn atomic
      let assignedTableId = dto.tableId;
      let assignedTableNumber = dto.tableNumber;

      if (effectiveOrderType === 'DINE_IN' && (dto.tableId || dto.tableNumber)) {
        try {
          const table = await this.resolveTable(dto.tableId, dto.tableNumber);
          if (table) {
            await DiningTable.update(
              { status: 'OCCUPIED', currentOrderId: orderId } as any,
              { where: { id: table.id }, transaction: t }
            );
            assignedTableId = table.id;
            assignedTableNumber = table.tableNumber;
          }
        } catch (tblErr) {
          console.warn('[Table Resolution Warning]:', tblErr);
        }
      }

      // 6b. Tạo Order
      const isAutoPaid =
        dto.paymentMethod === 'STUDENT_WALLET' || dto.paymentMethod === 'CAMPUS_WALLET';

      const order = await Order.create(
        {
          id: orderId,
          orderCode,
          userId: dto.userId || 'user-stu-1',
          userName: dto.userName || 'Sinh viên UniEat',
          userPhone: dto.userPhone || '0987654321',
          canteenId: dto.canteenId || 'cant-a',
          canteenName: dto.canteenName || 'Căng tin A2',
          orderType: effectiveOrderType,
          paymentMethod: dto.paymentMethod || 'CASH',
          voucherId: appliedVoucherId,
          discountAmount,
          totalAmount: subtotal,
          finalAmount: finalAmount,
          tableId: assignedTableId,
          tableNumber: assignedTableNumber,
          pickupSlot: dto.pickupSlot,
          deliveryAddressId: dto.deliveryAddressId,
          deliveryAddressText: dto.deliveryAddressText,
          notes: dto.notes,
          status: 'PENDING',
          isPaid: isAutoPaid,
          paidAt: isAutoPaid ? new Date() : undefined,
          pickupCode:
            effectiveOrderType === 'TAKEAWAY'
              ? `P${Math.floor(1000 + Math.random() * 9000)}`
              : undefined,
        },
        { transaction: t }
      );

      // 6c. bulkCreate details
      const details = await OrderDetail.bulkCreate(
        detailsToCreate.map((d) => ({ ...d, orderId: order.id })),
        { transaction: t }
      );

      // 6d. Trừ voucher
      if (appliedVoucherId) {
        try {
          await UserVoucher.update(
            { isUsed: true, usedAt: new Date() },
            {
              where: { userId: dto.userId, voucherId: appliedVoucherId, isUsed: false },
              transaction: t,
            }
          );
        } catch (vErr) {
          console.warn('[Voucher Update Notice]:', vErr);
        }
      }

      order.orderDetails = details;
      return order;
    });

    // 7. Side-effects NGOÀI transaction
    try {
      await cartService.clearCart(created.userId);
    } catch (e: any) {
      console.warn('[Redis Cart Cleanup Notice]:', e.message);
    }

    const orderJson: any =
      typeof (created as any)?.toJSON === 'function' ? (created as any).toJSON() : created;

    // Đảm bảo cả items và orderDetails đều có trong orderJson
    if (!orderJson.items && orderJson.orderDetails) {
      orderJson.items = orderJson.orderDetails.map((d: any, idx: number) => ({
        id: d.id || `item-${created.id}-${idx}`,
        food: {
          id: d.productId,
          name: d.productName,
          price: Number(d.unitPrice) || 0,
          image: d.productImage || '',
          canteenId: orderJson.canteenId,
          canteenName: orderJson.canteenName,
        },
        quantity: d.quantity || 1,
        unitPrice: Number(d.unitPrice) || 0,
        notes: d.notes || '',
      }));
    }
    if (!orderJson.orderDetails && orderJson.items) {
      orderJson.orderDetails = orderJson.items.map((it: any) => ({
        productId: it.food?.id || it.productId,
        productName: it.food?.name || it.productName,
        productImage: it.food?.image || it.productImage || '',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        notes: it.notes,
      }));
    }

    realtimeService.sendToUser(created.userId, 'order:created', orderJson);
    realtimeService.broadcast('canteen:new_order', {
      orderId: created.id,
      code: created.orderCode,
    });
    socketService.emitNewOrder(orderJson);
    socketService.emitOrderStatus(created.userId, orderJson);

    return created;
  }

  // ---------------------------------------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------------------------------------

  public async updateStatus(
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order | null> {
    const order = await this.findOrderByIdOrCode(orderId);
    if (!order) return null;

    // Validate state transition
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Không thể chuyển từ ${order.status} sang ${status}`);
    }

    const newNotes = reason
      ? order.notes
        ? `${order.notes} [Lý do: ${reason}]`
        : `Lý do: ${reason}`
      : order.notes;

    await sequelize.transaction(async (t) => {
      await Order.update(
        { status, notes: newNotes },
        { where: { id: order.id }, transaction: t }
      );

      // Cập nhật trạng thái bàn
      if (order.tableId || order.tableNumber) {
        const tableKey = order.tableId || order.tableNumber!;
        const targetTableStatus =
          status === 'CANCELLED' || status === 'COMPLETED' ? 'AVAILABLE' : 'OCCUPIED';
        await tableService.updateTableStatus(tableKey, targetTableStatus, order.id, t);
      }
    });

    order.status = status;
    if (newNotes) order.notes = newNotes;

    // Notification
    const { title, message } = this.buildStatusNotification(order, status, reason);
    try {
      await interactionService.createNotification({
        userId: order.userId,
        title,
        message,
        type: 'ORDER_STATUS',
        referenceId: order.id,
      });
    } catch (e: any) {
      console.warn('[OrderService] createNotification error:', e.message);
    }

    // Realtime
    const updatedJson =
      typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
    realtimeService.sendToUser(order.userId, 'order:status_changed', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
    });
    socketService.emitOrderStatus(order.userId, updatedJson);
    if (status === 'CONFIRMED' || status === 'PREPARING') {
      socketService.emitNewOrder(updatedJson);
    }

    return order;
  }

  // ---------------------------------------------------------------------------
  // CANCEL ORDER
  // ---------------------------------------------------------------------------

  public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    const order = await this.getOrderById(orderId);
    if (!order) return false;
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return false;

    await this.updateStatus(order.id, 'CANCELLED', reason);
    realtimeService.broadcast('order:cancelled', {
      orderId: order.id,
      orderCode: order.orderCode,
      userId: order.userId,
      userName: order.userName,
    });
    return true;
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private async buildOrderDetails(
    items: CreateOrderItemDTO[],
    productMap: Map<string, Product>,
    orderId: string
  ) {
    const result: Array<{
      id: string;
      orderId: string;
      productId: string;
      productName: string;
      productImage: string;
      unitPrice: number;
      quantity: number;
      itemSubtotal: number;
      selectedOptionsJson: SelectedOptionSnapshot[];
      notes?: string;
    }> = [];

    // Gom toàn bộ optionIds của mọi item rồi query 1 lần
    const allOptionIds = new Set<string>();
    for (const it of items) {
      const ids = this.extractOptionIds(it);
      ids.forEach((id) => allOptionIds.add(id));
    }

    const optionItems = allOptionIds.size
      ? await OptionItem.findAll({
        where: { id: Array.from(allOptionIds) },
        include: [OptionGroup],
      })
      : [];
    const optionMap = new Map(optionItems.map((o) => [o.id, o]));

    // Nếu productMap rỗng (ví dụ client gửi ID tuỳ ý), lấy 1 sản phẩm mặc định từ CSDL làm fallback FK
    let fallbackProduct: Product | null = null;
    if (productMap.size === 0) {
      fallbackProduct = await Product.findOne();
    }

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      let prod = productMap.get(it.productId);
      if (!prod) {
        prod = Array.from(productMap.values())[0] || fallbackProduct || undefined;
      }

      const basePrice = prod ? Number(prod.price) || (it.unitPrice || 0) : (it.unitPrice || 35000);
      const quantity = Math.max(1, Math.floor(it.quantity || 1));

      const selectedOptionSnapshots: SelectedOptionSnapshot[] = [];
      let totalOptionsPrice = 0;

      for (const optId of this.extractOptionIds(it)) {
        const optItem = optionMap.get(optId);
        if (!optItem) continue;
        const price = Number(optItem.price) || 0;
        totalOptionsPrice += price;
        selectedOptionSnapshots.push({
          groupId: (optItem as any).groupId || 'topping',
          groupName: (optItem as any).group?.name || 'Tùy chọn',
          optionId: optItem.id,
          optionName: optItem.name,
          extraPrice: price,
        });
      }

      const finalUnitPrice = basePrice + totalOptionsPrice;
      const itemSubtotal = finalUnitPrice * quantity;
      const resolvedProductId = prod?.id || fallbackProduct?.id || 'prod-1';

      result.push({
        id: `od-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        orderId,
        productId: resolvedProductId,
        productName: it.productName || prod?.name || 'Món ăn Căn tin',
        productImage: it.productImage || prod?.image || '',
        unitPrice: finalUnitPrice,
        quantity,
        itemSubtotal,
        selectedOptionsJson: selectedOptionSnapshots,
        notes: it.notes,
      });
    }

    return result;
  }

  private extractOptionIds(it: CreateOrderItemDTO): string[] {
    if (Array.isArray(it.selectedOptionIds) && it.selectedOptionIds.length) {
      return it.selectedOptionIds;
    }
    if (Array.isArray(it.selectedOptions) && it.selectedOptions.length) {
      return it.selectedOptions.map((o) => o.optionId).filter(Boolean);
    }
    return [];
  }

  private async resolveVoucher(dto: CreateOrderDTO, subtotal: number) {
    if (!dto.voucherCode && !dto.voucherId) {
      return { discountAmount: 0, voucherId: undefined as string | undefined };
    }

    try {
      const voucher = await Voucher.findOne({
        where: {
          isActive: true,
          [Op.or]: [
            dto.voucherId ? { id: dto.voucherId } : undefined,
            dto.voucherCode ? { code: dto.voucherCode.toUpperCase().trim() } : undefined,
          ].filter(Boolean) as any,
        },
      });
      if (!voucher) return { discountAmount: 0, voucherId: undefined };

      const minOrder = Number(voucher.minOrderAmount) || 0;
      if (subtotal < minOrder) {
        return { discountAmount: 0, voucherId: undefined };
      }

      const discountVal = Number(voucher.discountValue) || 0;
      let discountAmount = 0;
      if (voucher.discountType === 'FIXED') {
        discountAmount = discountVal;
      } else {
        discountAmount = Math.round((subtotal * discountVal) / 100);
        if (voucher.maxDiscount) {
          discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
        }
      }
      discountAmount = Math.min(discountAmount, subtotal);

      return { discountAmount, voucherId: voucher.id };
    } catch {
      return { discountAmount: 0, voucherId: undefined };
    }
  }

  private async resolveTable(tableId?: string, tableNumber?: string) {
    const key = tableId || tableNumber;
    if (!key) return null;
    return (
      (await tableService.getTableById(key)) ||
      (await tableService.findTableByQr(key))
    );
  }

  private buildStatusNotification(
    order: Order,
    status: OrderStatus,
    reason?: string
  ): { title: string; message: string } {
    switch (status) {
      case 'CONFIRMED':
        return {
          title: `Đơn #${order.orderCode} đã được nhận`,
          message: `Căn tin đã tiếp nhận đơn #${order.orderCode} và đang chuẩn bị đưa vào bếp.`,
        };
      case 'PREPARING':
        return {
          title: `Bếp đang nấu đơn #${order.orderCode}`,
          message: `Đầu bếp đang thực hiện các món cho đơn #${order.orderCode}.`,
        };
      case 'READY':
        return {
          title: `Món ăn đơn #${order.orderCode} đã nấu xong!`,
          message:
            order.orderType === 'DINE_IN'
              ? `Món đã sẵn sàng, nhân viên đang mang ra bàn ${order.tableNumber || ''}.`
              : order.orderType === 'TAKEAWAY'
                ? `Món đã nấu xong, mời bạn đến quầy nhận!`
                : `Món đã chuẩn bị xong, tài xế đang lấy đơn để giao.`,
        };
      case 'SERVED':
        return {
          title: `Món ăn đã giao ra bàn ${order.tableNumber || ''}`,
          message: `Chúc bạn ngon miệng!`,
        };
      case 'WAITING_PICKUP':
        return {
          title: `Mời nhận món #${order.orderCode}`,
          message: `Đơn mang về đã sẵn sàng. Mã nhận món: ${order.pickupCode || order.orderCode}.`,
        };
      case 'DELIVERING':
        return {
          title: `Đơn #${order.orderCode} đang được giao`,
          message: `Shipper đang giao đến ${order.deliveryAddressText || 'KTX'}.`,
        };
      case 'COMPLETED':
        return {
          title: `Đơn #${order.orderCode} đã hoàn tất`,
          message: `Cảm ơn bạn đã đặt hàng!`,
        };
      case 'CANCELLED':
        return {
          title: `Đơn #${order.orderCode} đã bị hủy`,
          message: reason ? `Lý do: ${reason}` : `Đơn hàng đã bị hủy.`,
        };
      default:
        return {
          title: `Cập nhật đơn #${order.orderCode}`,
          message: `Trạng thái mới: ${status}`,
        };
    }
  }
}

export const orderService = new OrderService();
