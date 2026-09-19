/**
 * ==============================================================================
 * CẤU HÌNH KẾT NỐI REAL-TIME SOCKET.IO (SOCKET CONFIGURATION)
 * ==============================================================================
 * [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN - LOCAL MACHINE CONFIG]:
 * 
 * 1. CLIENT_URL:
 *    - Đây là địa chỉ URL của Frontend ReactJS trên máy bạn (mặc định Vite chạy ở: http://localhost:5173).
 *    - Nếu bạn chạy Frontend ở cổng khác (ví dụ: http://localhost:3000), hãy đổi giá trị này
 *      trong file 'backend/.env' thành CLIENT_URL=http://localhost:3000.
 *
 * 2. PATH:
 *    - Đường dẫn Socket endpoint, mặc định là '/socket.io'.
 *    - Khớp với cấu hình Proxy trong file 'frontend/vite.config.ts'.
 *
 * 3. TRANSPORTS:
 *    - ['websocket', 'polling']: Cho phép kết nối trực tiếp qua giao thức WebSocket
 *      nhanh và mượt mà, tự động chuyển về HTTP long-polling nếu mạng chặn WebSocket.
 *
 * 4. TIMEOUTS:
 *    - pingTimeout (60000ms = 60s): Thời gian chờ phản hồi Ping từ client trước khi ngắt.
 *    - pingInterval (25000ms = 25s): Tần suất máy chủ gửi gói tin Heartbeat giữ kết nối.
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

export const socketConfig = {
  // Đường dẫn socket endpoint
  path: process.env.SOCKET_PATH || '/socket.io',

  // Cấu hình chia sẻ tài nguyên (CORS) cho máy client kết nối
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },

  // Phương thức truyền tải (ưu tiên WebSocket, dự phòng polling)
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],

  // Cấu hình heartbeat giữ kết nối ổn định
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT || '60000', 10),
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL || '25000', 10),

  // Giới hạn kích thước gói tin gửi nhận (1MB)
  maxHttpBufferSize: 1e6,

  // Danh sách các phòng (Rooms) mặc định của hệ thống căng tin
  rooms: {
    STAFF_CANTEEN: 'staff:canteen',     // Dành cho nhân viên bếp nhận đơn mới
    ADMIN_CHANNEL: 'admin:channel',     // Dành cho ban quản trị
    USER_PREFIX: 'user:',               // Tiền tố phòng riêng cho từng sinh viên (user:<userId>)
    TABLE_PREFIX: 'table:',             // Tiền tố phòng bàn ăn (table:<tableNumber>)
  },

  // Danh sách các sự kiện Socket.IO (Event Names)
  events: {
    // Đơn hàng
    ORDER_NEW: 'order:new',                       // Khi sinh viên bấm đặt món thành công
    ORDER_STATUS_UPDATED: 'order:status_updated', // Khi nhà bếp cập nhật trạng thái đơn
    ORDER_CANCELLED: 'order:cancelled',           // Khi đơn hàng bị hủy
    
    // Bàn ăn
    TABLE_OCCUPIED: 'table:occupied',             // Khi có sinh viên ngồi & quét QR bàn
    TABLE_RELEASED: 'table:released',             // Khi sinh viên ăn xong rời bàn
    
    // Thông báo
    NOTIFICATION_RECEIVED: 'notification:received', // Thông báo cá nhân hoặc flash sale
  },
};
