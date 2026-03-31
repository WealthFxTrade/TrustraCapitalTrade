// socket.js
import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} httpServer - HTTP server instance
 * @param {string[]} allowedOrigins - Array of allowed frontend origins
 * @returns {Server} io - Socket.IO server instance
 */
export const initIO = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow Postman / mobile apps (no origin)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) return callback(null, true);

        console.warn(`[SOCKET] CORS BLOCKED: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
    pingTimeout: 60000, // 60 seconds timeout
    transports: ['websocket', 'polling'], // WebSocket preferred, fallback to polling
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Node Connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join_room', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`[SOCKET] User ${userId} joined room`);
      }
    });

    // Optional: test ping/pong
    socket.on('ping', (data) => {
      socket.emit('pong', { received: data });
    });

    // Handle disconnects
    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] Node Disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

/**
 * Get initialized Socket.IO instance
 * @returns {Server} io
 */
export const getIO = () => {
  if (!io) {
    throw new Error("[SOCKET] Socket.io not initialized!");
  }
  return io;
};
