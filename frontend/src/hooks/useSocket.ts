/**
 * HOOK USESOCKET - KẾT NỐI REAL-TIME CLIENT
 */
import { useEffect, useState } from 'react';
import { initSocket, getSocket } from '../services/socket.client';
import { useAuth } from './useAuth';

export function useSocket() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = initSocket(user.id, user.role);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [user?.id, user?.role]);

  return {
    socket: getSocket(),
    isConnected: connected,
  };
}
