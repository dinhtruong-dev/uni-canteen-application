import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentUserId: string | null = null;
let currentUserRole: string | null = null;

// Kết nối trực tiếp tới Backend (tránh đi qua proxy Vite dễ gây drop kết nối)
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : window.location.origin);

export const initSocket = (userId: string, role: string): Socket => {
  // 1. Nếu socket đang hoạt động và đúng người dùng -> Tái sử dụng, KHÔNG ngắt kết nối
  if (socket && socket.connected && currentUserId === userId && currentUserRole === role) {
    return socket;
  }

  // 2. Nếu đã có socket cũ nhưng đổi người dùng hoặc đổi role -> Ngắt kết nối cũ
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentUserId = userId;
  currentUserRole = role;

  // 3. Khởi tạo kết nối Socket.IO mới với đầy đủ cấu hình Reconnection & Transports
  socket = io(SOCKET_SERVER_URL, {
    path: '/socket.io',
    query: { userId, role },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log(`[Socket.IO Client] ✅ Đã kết nối Socket Server (${SOCKET_SERVER_URL}) với ID:`, socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO Client] 🔌 Ngắt kết nối từ server, lý do:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket.IO Client] ⚠️ Lỗi kết nối Socket.IO:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
    currentUserRole = null;
  }
};
