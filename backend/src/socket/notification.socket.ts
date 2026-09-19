/**
 * ==============================================================================
 * MODULE XỬ LÝ SỰ KIỆN REAL-TIME THÔNG BÁO (NOTIFICATION SOCKET HANDLER)
 * ==============================================================================
 * Quản lý phát thông báo tức thì:
 * - Thông báo cá nhân (ví dụ: hoàn tiền ví, nạp tiền ví thành công, voucher tặng).
 * - Thông báo diện rộng toàn trường (ví dụ: khung giờ vàng Flash Sale, khuyến mãi trưa).
 * ==============================================================================
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketConfig } from '../config/socket.config';

export function registerNotificationSocketHandlers(io: SocketIOServer, socket: Socket) {
  // Lắng nghe sự kiện xác nhận đã đọc thông báo (tùy chọn)
  socket.on('notification:read', (data: { notificationId: string }) => {
    console.log(`[Socket Notification] Client ${socket.id} đã đọc thông báo:`, data.notificationId);
  });
}

/**
 * Gửi thông báo đến một sinh viên cụ thể
 */
export function emitNotificationToUser(io: SocketIOServer | null, userId: string, notificationData: any) {
  if (!io) return;
  io.to(`${socketConfig.rooms.USER_PREFIX}${userId}`).emit(
    socketConfig.events.NOTIFICATION_RECEIVED,
    notificationData
  );
  console.log(`[Socket Notification] Gửi thông báo tới user:${userId}: ${notificationData.title}`);
}

/**
 * Phát thông báo toàn trường (Broadcast tới tất cả client đang kết nối)
 */
export function broadcastNotification(io: SocketIOServer | null, notificationData: any) {
  if (!io) return;
  io.emit(socketConfig.events.NOTIFICATION_RECEIVED, notificationData);
  console.log(`[Socket Notification] Phát thông báo toàn hệ thống: ${notificationData.title}`);
}
