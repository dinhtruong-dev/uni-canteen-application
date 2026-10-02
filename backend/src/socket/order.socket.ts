/**
 * ==============================================================================
 * MODULE XỬ LÝ SỰ KIỆN REAL-TIME ĐƠN HÀNG (ORDER SOCKET HANDLER)
 * ==============================================================================
 * Quản lý các thông báo tức thì:
 * - Nhân viên bếp & KDS nhận chuông báo khi có đơn hàng mới từ sinh viên.
 * - Sinh viên nhận cập nhật thời gian thực khi đơn đổi trạng thái (Tiếp nhận -> Đang nấu -> Mời lấy).
 * - Trao đổi tin nhắn trực tiếp giữa khách hàng và nhân viên căn tin (Chat theo đơn).
 * ==============================================================================
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketConfig } from '../config/socket.config';

// In-memory store for order messages/chat
const orderMessagesMap = new Map<string, Array<{
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'STAFF' | 'KITCHEN';
  message: string;
  timestamp: string;
}>>();

export function registerOrderSocketHandlers(io: SocketIOServer, socket: Socket) {
  // Khi client muốn tham gia lắng nghe cụ thể một đơn hàng
  socket.on('order:join', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`[Socket Order] Socket ${socket.id} đã vào theo dõi đơn hàng: order:${orderId}`);
    
    // Gửi lại lịch sử tin nhắn của đơn hàng này nếu có
    const messages = orderMessagesMap.get(orderId) || [];
    socket.emit('order:messages:history', { orderId, messages });
  });

  // Khi client rời phòng theo dõi đơn
  socket.on('order:leave', (orderId: string) => {
    socket.leave(`order:${orderId}`);
    console.log(`[Socket Order] Socket ${socket.id} đã rời phòng đơn hàng: order:${orderId}`);
  });

  // Khi nhân viên đăng ký vào ca trực
  socket.on('staff:join', (data?: { canteenId?: string }) => {
    socket.join(socketConfig.rooms.STAFF_CANTEEN);
    socket.join('kitchen:kds');
    if (data?.canteenId) {
      socket.join(`canteen:${data.canteenId}`);
    }
    console.log(`[Socket Order] Socket ${socket.id} đã tham gia ca trực nhân viên & KDS:`, data);
  });

  // Khi màn hình KDS đăng ký kết nối
  socket.on('kds:join', (data?: { canteenId?: string }) => {
    socket.join('kitchen:kds');
    socket.join(socketConfig.rooms.STAFF_CANTEEN);
    if (data?.canteenId) {
      socket.join(`canteen:${data.canteenId}`);
    }
    console.log(`[Socket Order] Màn hình Bếp KDS đã kết nối (${socket.id}):`, data);
  });

  // Client phát sự kiện đặt đơn hàng mới trực tiếp
  socket.on('order:place', (orderData: any) => {
    console.log(`[Socket Order] Nhận đơn hàng mới từ client #${orderData?.orderCode || orderData?.id}`);
    emitNewOrderToStaff(io, orderData);
  });

  // Trao đổi tin nhắn giữa Khách hàng và Nhân viên (Live Chat)
  socket.on('order:message:send', (payload: {
    orderId: string;
    senderId: string;
    senderName: string;
    senderRole: 'CUSTOMER' | 'STAFF' | 'KITCHEN';
    message: string;
    targetUserId?: string;
  }) => {
    const { orderId, senderId, senderName, senderRole, message, targetUserId } = payload;
    if (!orderId || !message?.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId,
      senderId,
      senderName: senderName || (senderRole === 'CUSTOMER' ? 'Khách hàng' : 'Nhân viên Căn tin'),
      senderRole,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    // Lưu vào bộ nhớ tạm
    if (!orderMessagesMap.has(orderId)) {
      orderMessagesMap.set(orderId, []);
    }
    orderMessagesMap.get(orderId)!.push(newMsg);

    console.log(`[Socket Chat] [Đơn ${orderId}] ${senderName} (${senderRole}): ${message}`);

    // 1. Gửi tới phòng riêng của đơn hàng
    io.to(`order:${orderId}`).emit('order:message:received', newMsg);

    // 2. Nếu khách nhắn -> Báo cho toàn bộ nhân viên căn tin
    if (senderRole === 'CUSTOMER') {
      io.to(socketConfig.rooms.STAFF_CANTEEN).emit('order:message:received', newMsg);
      io.emit('staff:chat:alert', {
        orderId,
        senderName,
        message: newMsg.message,
        timestamp: newMsg.timestamp,
      });
    }

    // 3. Nếu nhân viên nhắn -> Báo cho sinh viên
    if (senderRole === 'STAFF' || senderRole === 'KITCHEN') {
      if (targetUserId) {
        io.to(`${socketConfig.rooms.USER_PREFIX}${targetUserId}`).emit('order:message:received', newMsg);
      }
      // Broadcast để đảm bảo nếu sinh viên chưa vào phòng đơn thì vẫn nhận toast
      io.emit('customer:chat:alert', {
        orderId,
        senderName,
        message: newMsg.message,
        timestamp: newMsg.timestamp,
        targetUserId,
      });
    }
  });
}

/**
 * Gửi thông báo đơn hàng mới đến toàn bộ nhân viên căng tin & ban quản trị & màn hình bếp KDS
 */
export function emitNewOrderToStaff(io: SocketIOServer | null, orderData: any) {
  if (!io) return;
  const roomStaff = socketConfig.rooms.STAFF_CANTEEN;
  io.to(roomStaff).emit(socketConfig.events.ORDER_NEW, orderData);
  io.to('kitchen:kds').emit(socketConfig.events.ORDER_NEW, orderData);
  if (orderData.canteenId) {
    io.to(`canteen:${orderData.canteenId}`).emit(socketConfig.events.ORDER_NEW, orderData);
  }
  // Phát toàn cục để tất cả các màn hình Nhân viên và Bếp KDS đều nhận được lập tức
  io.emit(socketConfig.events.ORDER_NEW, orderData);
  console.log(`[Socket Order] Đã phát sự kiện Đơn mới #${orderData.orderCode || orderData.id || orderData.orderNumber} tới Nhân viên & Bếp KDS`);
}

/**
 * Gửi cập nhật trạng thái đơn hàng tới sinh viên đặt món và nhân viên theo dõi
 */
export function emitOrderStatusUpdate(io: SocketIOServer | null, userId: string, orderData: any) {
  if (!io) return;
  
  // 1. Gửi tới phòng riêng của sinh viên đặt món
  if (userId) {
    io.to(`${socketConfig.rooms.USER_PREFIX}${userId}`).emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);
  }
  
  // 2. Gửi tới phòng cụ thể của đơn hàng (nếu sinh viên đang mở màn hình chi tiết đơn)
  if (orderData.id) {
    io.to(`order:${orderData.id}`).emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);
  }
  
  // 3. Cập nhật trên màn hình Dashboard của nhân viên & KDS
  io.to(socketConfig.rooms.STAFF_CANTEEN).emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);
  io.to('kitchen:kds').emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);

  // 4. Phát toàn cục đảm bảo đồng bộ 100%
  io.emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);

  console.log(`[Socket Order] Đã cập nhật trạng thái đơn #${orderData.orderCode || orderData.id || orderData.orderNumber} -> ${orderData.status}`);
}
