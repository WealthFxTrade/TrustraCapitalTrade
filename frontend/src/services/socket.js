// frontend/src/services/socket.js
import { io } from 'socket.io-client';

let socket;

export const connectSocket = () => {
  if (socket) return socket;

  // Dynamically determine backend URL
  const BACKEND_URL =
    import.meta.env.VITE_SOCKET_URL ||
    'https://trustracapitaltrade-backend.onrender.com';

  socket = io(BACKEND_URL, {
    transports: ['websocket'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log(`🟢 SOCKET CONNECTED: ${socket.id}`);
  });

  socket.on('disconnect', (reason) => {
    console.warn(`🔴 SOCKET DISCONNECTED: ${reason}`);
  });

  socket.on('error', (err) => {
    console.error('SOCKET ERROR:', err);
  });

  return socket;
};

export const getSocket = () => socket;
