/**
 * ==============================================================================
 * MODULE XỬ LÝ SỰ KIỆN REAL-TIME BÀN ĂN & QUÉT MÃ QR (TABLE SOCKET HANDLER)
 * ==============================================================================
 * Quản lý trạng thái bàn ăn tại căng tin theo thời gian thực:
 * - Khi sinh viên quét mã QR tại bàn A01, báo về hệ thống bàn đang có người.
 * - Khi đơn hàng hoàn thành/sinh viên rời bàn, đổi trạng thái bàn sang trống.
 * ==============================================================================
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketConfig } from '../config/socket.config';

export function registerTableSocketHandlers(io: SocketIOServer, socket: Socket) {
  // Khi sinh viên quét QR bàn, tham gia phòng của bàn ăn đó
  socket.on('table:join', (tableNumber: string) => {
    socket.join(`${socketConfig.rooms.TABLE_PREFIX}${tableNumber}`);
    console.log(`[Socket Table] Client ${socket.id} đã vào bàn: ${tableNumber}`);
  });

  socket.on('table:leave', (tableNumber: string) => {
    socket.leave(`${socketConfig.rooms.TABLE_PREFIX}${tableNumber}`);
    console.log(`[Socket Table] Client ${socket.id} đã rời bàn: ${tableNumber}`);
  });
}

/**
 * Cập nhật trạng thái bàn ăn tới nhân viên và khách hàng
 */
export function emitTableStatusChange(io: SocketIOServer | null, tableData: { tableNumber: string; isOccupied: boolean; currentOrderId?: string }) {
  if (!io) return;
  const eventName = tableData.isOccupied ? socketConfig.events.TABLE_OCCUPIED : socketConfig.events.TABLE_RELEASED;
  io.to(socketConfig.rooms.STAFF_CANTEEN).emit(eventName, tableData);
  io.to(`${socketConfig.rooms.TABLE_PREFIX}${tableData.tableNumber}`).emit(eventName, tableData);
  console.log(`[Socket Table] Cập nhật bàn ${tableData.tableNumber}: ${tableData.isOccupied ? 'Có khách' : 'Trống'}`);
}
