import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (userId: string, role: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  socket = io({
    path: '/socket.io',
    query: { userId, role },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket.IO Client] Connected to server with ID:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO Client] Disconnected from server');
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
  }
};
