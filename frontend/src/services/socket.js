import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (!token || socket) return socket;

  socket = io(import.meta.env.VITE_WS_URL || "http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("🟢 Trustra WS connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.warn("🔴 Trustra WS disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("WS error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
