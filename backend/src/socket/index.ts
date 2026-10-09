/**
 * ==============================================================================
 * SOCKET.IO REAL-TIME SERVER ENTRY POINT (BACKEND SOCKET MODULE)
 * ==============================================================================
 * Khởi tạo và quản lý toàn bộ kết nối WebSocket thời gian thực cho hệ thống UniEat.
 * Kết nối tự động sử dụng cấu hình từ 'src/config/socket.config.ts'.
 * ==============================================================================
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketConfig } from '../config/socket.config';
import {
  registerOrderSocketHandlers,
  emitNewOrderToStaff,
  emitOrderStatusUpdate,
} from './order.socket';
import {
  registerNotificationSocketHandlers,
  emitNotificationToUser,
  broadcastNotification,
} from './notification.socket';
import {
  registerTableSocketHandlers,
  emitTableStatusChange,
} from './table.socket';

class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  private constructor() { }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  /**
   * Khởi tạo Socket.IO Server gắn với HTTP Server của Express
   */
  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      path: socketConfig.path,
      cors: socketConfig.cors,
      transports: socketConfig.transports,
      pingTimeout: socketConfig.pingTimeout,
      pingInterval: socketConfig.pingInterval,
      maxHttpBufferSize: socketConfig.maxHttpBufferSize,
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket.handshake.query.userId as string) || 'guest';
      const role = (socket.handshake.query.role as string) || 'STUDENT';

      // 1. Tự động đưa sinh viên vào phòng riêng cá nhân
      socket.join(`${socketConfig.rooms.USER_PREFIX}${userId}`);

      if (role === 'STAFF' || role === 'ADMIN') {
        socket.join(socketConfig.rooms.STAFF_CANTEEN);
        socket.join(socketConfig.rooms.ADMIN_CHANNEL);
      }

      console.log(
        `⚡ [Socket.IO] Client kết nối thành công: ${socket.id} (User: ${userId}, Role: ${role})`
      );

      // Đăng ký các module sự kiện con
      registerOrderSocketHandlers(this.io!, socket);
      registerNotificationSocketHandlers(this.io!, socket);
      registerTableSocketHandlers(this.io!, socket);

      // Ngắt kết nối
      socket.on('disconnect', (reason) => {
        const isClientAction = reason === 'transport close' || reason === 'client namespace disconnect';
        const actionNote = isClientAction ? ' (F5 làm mới, đóng tab hoặc đổi trang)' : '';
        console.log(`🔌 [Socket.IO] Client ngắt kết nối: ${socket.id} (User: ${userId}, Role: ${role}) -> Lý do: ${reason}${actionNote}`);
      });
    });

    console.log(`[Socket.IO] Khởi tạo thành công! Sẵn sàng nhận kết nối tại path: ${socketConfig.path}`);
    return this.io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  // --- Các hàm tiện ích phát sự kiện thời gian thực ra toàn hệ thống ---

  /** Báo đơn hàng mới cho nhân viên bếp */
  public emitNewOrder(orderData: any) {
    emitNewOrderToStaff(this.io, orderData);
  }

  /** Báo đổi trạng thái đơn hàng cho sinh viên */
  public emitOrderStatus(userId: string, orderData: any) {
    emitOrderStatusUpdate(this.io, userId, orderData);
  }

  /** Gửi thông báo trực tiếp đến 1 sinh viên */
  public sendNotificationToUser(userId: string, notificationData: any) {
    emitNotificationToUser(this.io, userId, notificationData);
  }

  /** Gửi thông báo khuyến mãi / hệ thống cho toàn trường */
  public broadcastNotification(notificationData: any) {
    broadcastNotification(this.io, notificationData);
  }

  /** Cập nhật trạng thái bàn ăn QR */
  public emitTableStatus(tableData: { tableNumber: string; isOccupied: boolean; currentOrderId?: string }) {
    emitTableStatusChange(this.io, tableData);
  }
}

export const socketManager = SocketManager.getInstance();
export { SocketManager };
export * from './order.socket';
export * from './notification.socket';
export * from './table.socket';
