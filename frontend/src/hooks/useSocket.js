// src/hooks/useSocket.js

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Manages a Socket.IO connection with authentication and event binding.
 *
 * @param {Object} options
 * @param {string} options.userId   — user ID to join a private room
 * @param {string} options.token    — JWT for socket auth
 * @param {Object} options.events   — { eventName: handlerFn } map
 */
export function useSocket({ userId, token, events = {} } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId || !token || !SOCKET_URL) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.debug('[Socket] Connected:', socket.id);
      socket.emit('join_room', userId);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.debug('[Socket] Disconnected:', reason);
    });

    // Bind all event listeners
    const eventEntries = Object.entries(events);
    eventEntries.forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Unbind all listeners before disconnect
      eventEntries.forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return socketRef;
}
