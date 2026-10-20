import { Order } from '../../models';
import { orderService } from '../shared/order.service';
import { canteenService } from '../shared/canteen.service';

export class StaffOrderService {
  public async getDashboard(canteenId: string) {
    const orders = await orderService.getAllOrders(undefined, canteenId);

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
          todayRevenue += Number(o.finalAmount) || 0;
          if (o.status === 'COMPLETED') completedToday++;
        }
        if (orderTime >= startOfWeek) weekRevenue += Number(o.finalAmount) || 0;
        if (orderTime >= startOfMonth) monthRevenue += Number(o.finalAmount) || 0;
      }
    });

    const sorted = [...orders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const recentOrders = this.enrichWithElapsed(sorted.slice(0, 10));
    const pendingOrders = this.enrichWithElapsed(
      sorted.filter((o) => o.status === 'PENDING')
    );

    const canteen = await canteenService.getCanteenById(canteenId);

    return {
      canteen: canteen || null,
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
    };
  }

  public async getStatistics(canteenId: string) {
    const orders = await orderService.getAllOrders(undefined, canteenId);

    const daysMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      daysMap[key] = { date: key, revenue: 0, ordersCount: 0 };
    }

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let completedOrders = 0;
    let cancelledOrders = 0;

    const methodBreakdown = {
      DINE_IN: { count: 0, revenue: 0 },
      TAKEAWAY: { count: 0, revenue: 0 },
      DELIVERY: { count: 0, revenue: 0 },
    };

    const productSales: Record<string, { id: string; name: string; image: string; quantity: number; revenue: number }> = {};

    orders.forEach((o) => {
      const key = o.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

      if (o.status === 'COMPLETED') completedOrders++;
      else if (o.status === 'CANCELLED') cancelledOrders++;

      if (o.status === 'COMPLETED' || o.isPaid) {
        totalRevenue += Number(o.finalAmount) || 0;

        if (daysMap[key]) {
          daysMap[key].revenue += Number(o.finalAmount) || 0;
          daysMap[key].ordersCount += 1;
        }

        const m = o.orderType || 'DINE_IN';
        if (methodBreakdown[m as keyof typeof methodBreakdown]) {
          methodBreakdown[m as keyof typeof methodBreakdown].count += 1;
          methodBreakdown[m as keyof typeof methodBreakdown].revenue += Number(o.finalAmount) || 0;
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

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      cancelledOrders,
      methodBreakdown,
      dailyChart: Object.values(daysMap),
      topProducts,
    };
  }

  public async getOrders(params: {
    canteenId?: string;
    receiveMethod?: string;
    orderType?: string;
    status?: string;
    paymentStatus?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    let list = await orderService.getAllOrders(undefined, params.canteenId);

    const method = params.receiveMethod || params.orderType;
    if (method && method !== 'ALL') {
      if (method === 'PICKUP' || method === 'TAKEAWAY') {
        list = list.filter((o) => o.orderType === 'TAKEAWAY');
      } else {
        list = list.filter((o) => o.orderType === method);
      }
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((o) => o.status === params.status);
    }

    if (params.paymentStatus && params.paymentStatus !== 'ALL') {
      if (params.paymentStatus === 'PAID') list = list.filter((o) => o.isPaid === true);
      else if (params.paymentStatus === 'PENDING') list = list.filter((o) => o.isPaid === false);
    }

    if (params.search) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.userName.toLowerCase().includes(q) ||
          o.userPhone.toLowerCase().includes(q) ||
          (o.pickupCode && o.pickupCode.toLowerCase().includes(q)) ||
          (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
          (o.deliveryAddressText && o.deliveryAddressText.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = list.length;
    const totalPages = Math.ceil(total / params.limit) || 1;
    const startIndex = (params.page - 1) * params.limit;
    const paginated = list.slice(startIndex, startIndex + params.limit);

    return {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      data: this.enrichWithElapsed(paginated),
    };
  }

  public getValidOrderTransitions(order: Order): Record<string, string[]> {
    return {
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
      CANCELLED: [],
    };
  }

  public isTransitionAllowed(
    order: Order,
    targetStatus: string
  ): { ok: boolean; message?: string } {
    const current = order.status;
    const transitions = this.getValidOrderTransitions(order);
    const allowed = transitions[current] || [];

    if (!allowed.includes(targetStatus)) {
      return {
        ok: false,
        message: `Chuyển trạng thái không hợp lệ: không thể chuyển từ ${current} sang ${targetStatus}`,
      };
    }
    return { ok: true };
  }

  public buildStatusMessage(order: Order, targetStatus: string): string {
    switch (targetStatus) {
      case 'CONFIRMED':
        return `Đã duyệt đơn #${order.orderCode} thành công`;
      case 'PREPARING':
        return `Bếp đã nhận đơn #${order.orderCode} và đang nấu`;
      case 'SERVED':
        return `Đã phục vụ mang món ra bàn ${order.tableNumber || ''} cho khách`;
      case 'COMPLETED':
        return `Đơn hàng #${order.orderCode} đã hoàn tất thành công`;
      default:
        return `Đơn hàng #${order.orderCode} đã cập nhật sang trạng thái ${targetStatus}`;
    }
  }

  public async verifyPickup(code: string, canteenId?: string) {
    const order = await orderService.findOrderByIdOrCode(code);
    if (!order) {
      return { ok: false, status: 404, message: `Không tìm thấy đơn hàng với mã "${code}"!` };
    }
    if (canteenId && canteenId !== 'ALL' && order.canteenId !== canteenId) {
      return {
        ok: false,
        status: 404,
        message: `Đơn hàng không thuộc căn tin này!`,
      };
    }
    if (order.status === 'COMPLETED') {
      return {
        ok: false,
        status: 400,
        message: `Đơn hàng #${order.orderCode} đã được nhận trước đó rồi!`,
        order,
      };
    }
    if (order.status === 'CANCELLED') {
      return {
        ok: false,
        status: 400,
        message: `Đơn hàng #${order.orderCode} đã bị hủy, không thể giao món!`,
        order,
      };
    }

    await Order.update(
      { status: 'COMPLETED', isPaid: true },
      { where: { id: order.id } }
    );
    order.status = 'COMPLETED';
    order.isPaid = true;

    return {
      ok: true,
      status: 200,
      message: `Xác nhận khách nhận món thành công! Đơn hàng #${order.orderCode} đã hoàn thành.`,
      order,
    };
  }

  private enrichWithElapsed(orders: Order[]): any[] {
    const now = Date.now();
    return orders.map((o) => {
      const json = typeof (o as any)?.toJSON === 'function' ? (o as any).toJSON() : o;
      const elapsedMinutes = Math.max(
        0,
        Math.floor((now - o.createdAt.getTime()) / 60000)
      );
      return { ...json, elapsedMinutes };
    });
  }
}

export const staffOrderService = new StaffOrderService();
