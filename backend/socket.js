// backend/socket.js
import { Server } from "socket.io";

export const initIO = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("🔴 Client disconnected:", socket.id, "Reason:", reason);
    });

    // You can add custom events here, e.g.:
    // socket.on("join_room", (room) => socket.join(room));
    // socket.on("message", (data) => io.to(data.room).emit("message", data));
  });

  return io;
};
