// socket.js - WebSocket / Real-time Engine
import { Server } from 'socket.io';

let io;

export const initIO = (httpServer, allowedOrigins = []) => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    transports: ['websocket']
  });

  io.on('connection', (socket) => {
    console.log(`🟢 WS CONNECTED: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.warn(`🔴 WS DISCONNECTED: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error('WS ERROR:', err);
    });
  });

  return io;
};
