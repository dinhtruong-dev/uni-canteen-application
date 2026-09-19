/**
 * ==============================================================================
 * MODULE XỬ LÝ SỰ KIỆN REAL-TIME ĐƠN HÀNG (ORDER SOCKET HANDLER)
 * ==============================================================================
 * Quản lý các thông báo tức thì:
 * - Nhân viên bếp nhận chuông báo khi có đơn hàng mới từ sinh viên.
 * - Sinh viên nhận cập nhật thời gian thực khi đơn đổi trạng thái (Tiếp nhận -> Đang nấu -> Mời lấy).
 * ==============================================================================
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketConfig } from '../config/socket.config';

export function registerOrderSocketHandlers(io: SocketIOServer, socket: Socket) {
  // Khi client muốn tham gia lắng nghe cụ thể một đơn hàng
  socket.on('order:join', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`[Socket Order] Socket ${socket.id} đã vào theo dõi đơn hàng: order:${orderId}`);
  });

  // Khi client rời phòng theo dõi đơn
  socket.on('order:leave', (orderId: string) => {
    socket.leave(`order:${orderId}`);
    console.log(`[Socket Order] Socket ${socket.id} đã rời phòng đơn hàng: order:${orderId}`);
  });
}

/**
 * Gửi thông báo đơn hàng mới đến toàn bộ nhân viên căng tin & ban quản trị
 */
export function emitNewOrderToStaff(io: SocketIOServer | null, orderData: any) {
  if (!io) return;
  io.to(socketConfig.rooms.STAFF_CANTEEN).emit(socketConfig.events.ORDER_NEW, orderData);
  console.log(`[Socket Order] Đã phát sự kiện Đơn mới #${orderData.orderCode || orderData.id} tới nhân viên căng tin`);
}

/**
 * Gửi cập nhật trạng thái đơn hàng tới sinh viên đặt món và nhân viên theo dõi
 */
export function emitOrderStatusUpdate(io: SocketIOServer | null, userId: string, orderData: any) {
  if (!io) return;
  
  // 1. Gửi tới phòng riêng của sinh viên đặt món
  io.to(`${socketConfig.rooms.USER_PREFIX}${userId}`).emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);
  
  // 2. Gửi tới phòng cụ thể của đơn hàng (nếu sinh viên đang mở màn hình chi tiết đơn)
  if (orderData.id) {
    io.to(`order:${orderData.id}`).emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);
  }
  
  // 3. Cập nhật trên màn hình Dashboard của nhân viên
  io.to(socketConfig.rooms.STAFF_CANTEEN).emit(socketConfig.events.ORDER_STATUS_UPDATED, orderData);

  console.log(`[Socket Order] Đã cập nhật trạng thái đơn #${orderData.orderCode || orderData.id} -> ${orderData.status}`);
}
