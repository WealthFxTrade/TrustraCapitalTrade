import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:10000';

export function useSocket({ userId, token, events = {} } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Connected:', socket.id);

      // ✅ FIXED EVENT NAME
      socket.emit('join', userId);
    });

    socket.on('connect_error', (err) => {
      console.warn('❌ Socket error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });

    // Bind events
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });

      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, token]);

  return socketRef;
}
