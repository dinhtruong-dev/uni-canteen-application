import { apiClient } from './apiClient';
import { Order, OrderStatus, CartItem, TimelineEvent } from '../../types';

export const adaptBackendOrderToFrontend = (o: any): Order => {
  const items: CartItem[] = (o.orderDetails || []).map((detail: any, idx: number) => ({
    id: `item-${o.id}-${idx}`,
    food: {
      id: detail.productId,
      name: detail.productName,
      canteenId: o.canteenId,
      canteenName: o.canteenName,
      categoryId: 'cat-1',
      price: Number(detail.unitPrice) || 0,
      image: detail.productImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      description: '',
      ingredients: [],
      isAvailable: true,
      rating: 5,
      reviewCount: 10,
      preparationTime: 10,
    },
    quantity: detail.quantity,
    selectedSize: detail.selectedOptions?.find((opt: any) => opt.type === 'SIZE' || opt.name?.includes('Suất') || opt.name?.includes('Size')),
    selectedToppings: detail.selectedOptions?.filter((opt: any) => opt.type === 'TOPPING' || opt.name?.includes('Trứng') || opt.name?.includes('Topping')) || [],
    notes: detail.note || detail.notes || '',
    unitPrice: Number(detail.unitPrice) || 0,
  }));

  const timeline: TimelineEvent[] = [
    {
      status: 'PENDING',
      title: 'Đã nhận đơn hàng',
      description: 'Hệ thống đã xác nhận đơn hàng của bạn',
      time: new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      completed: true,
    },
    {
      status: 'CONFIRMED',
      title: 'Căng tin tiếp nhận',
      description: `Bếp tại ${o.canteenName || 'căng tin'} đã nhận đơn`,
      time: new Date(new Date(o.createdAt).getTime() + 2 * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      completed: ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED'].includes(o.status),
    },
    {
      status: 'PREPARING',
      title: 'Đang nấu & đóng gói',
      description: 'Đầu bếp đang thực hiện món ăn',
      time: new Date(new Date(o.createdAt).getTime() + 6 * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      completed: ['PREPARING', 'READY', 'DELIVERING', 'COMPLETED'].includes(o.status),
    },
    {
      status: 'READY',
      title: o.orderType === 'DELIVERY' ? 'Shipper giao món' : 'Sẵn sàng lấy món',
      description: o.orderType === 'DELIVERY' ? 'Shipper KTX đang giao đến bạn' : `Mời đến quầy nhận món (${o.pickupCode || 'Mã nhận món'})`,
      time: new Date(new Date(o.createdAt).getTime() + 15 * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      completed: ['READY', 'DELIVERING', 'COMPLETED'].includes(o.status),
    },
    {
      status: 'COMPLETED',
      title: 'Hoàn tất đơn hàng',
      description: 'Cảm ơn bạn đã dùng bữa tại UniEat',
      time: new Date(new Date(o.createdAt).getTime() + 25 * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      completed: o.status === 'COMPLETED',
    },
  ];

  return {
    id: o.id,
    orderCode: o.orderCode || o.id,
    orderNumber: o.orderCode || o.id,
    userId: o.userId,
    userName: o.userName || 'Sinh viên',
    userPhone: o.userPhone || '0987654321',
    orderType: o.orderType || 'DELIVERY',
    canteenId: o.canteenId,
    canteenName: o.canteenName || 'Căng Tin Đại Học',
    items,
    subtotal: Number(o.totalAmount) || 0,
    shippingFee: o.orderType === 'DELIVERY' ? 10000 : 0,
    discountAmount: Number(o.discountAmount) || 0,
    totalAmount: Number(o.finalAmount || o.totalAmount) || 0,
    paymentMethod: o.paymentMethod || 'CAMPUS_WALLET',
    paymentStatus: o.isPaid ? 'PAID' : (o.paymentStatus || 'PENDING'),
    status: o.status,
    createdAt: new Date(o.createdAt).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    estimatedTime: o.orderType === 'PICKUP' ? (o.pickupSlot || '15 phút') : '20 - 30 phút',
    tableInfo: o.tableId ? {
      tableCode: o.tableId,
      tableName: o.tableNumber || 'Bàn ăn',
      canteenId: o.canteenId,
      canteenName: o.canteenName,
      status: 'OCCUPIED',
    } : undefined,
    pickupTimeSlot: o.pickupSlot,
    deliveryAddress: o.deliveryAddressText ? {
      id: o.deliveryAddressId || 'addr-1',
      label: o.deliveryAddressText,
      building: o.deliveryAddressText.split(',')[1]?.trim() || 'KTX',
      room: o.deliveryAddressText.split(',')[0]?.trim() || 'Phòng',
      note: o.notes,
      isDefault: true,
    } : undefined,
    notes: o.notes,
    qrCodeValue: `ORDER_${o.orderCode || o.id}`,
    timeline,
  };
};

export class OrderService {
  public async getOrders(params?: Record<string, any>): Promise<Order[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/orders', params);
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(adaptBackendOrderToFrontend);
    }
    return [];
  }

  public async getOrderById(id: string): Promise<Order | null> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/orders/${id}`);
    if (res?.success && res.data) {
      return adaptBackendOrderToFrontend(res.data);
    }
    return null;
  }

  public async createOrder(orderPayload: any): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/orders', orderPayload);
    return res;
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<any> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/orders/${id}/status`, { status });
    return res;
  }

  public async cancelOrder(id: string, reason?: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/orders/${id}/cancel`, { reason });
    return res;
  }
}

export const orderService = new OrderService();
