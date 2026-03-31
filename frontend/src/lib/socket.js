// src/lib/socket.js
import { io } from 'socket.io-client';

const isDevelopment = import.meta.env.DEV;
const socketBaseUrl = import.meta.env.VITE_SOCKET_URL || '';

const socket = io(
  isDevelopment ? '' : socketBaseUrl,
  {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
    timeout: 20000,
  }
);

export default socket;
