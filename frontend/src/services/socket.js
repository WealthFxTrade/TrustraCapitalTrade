import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (!token) return null;
  if (socket?.connected) return socket;

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    withCredentials: true
  });

  socket.on("connect", () => {
    console.log("🟢 Trustra WS connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("🔴 Trustra WS disconnected:", reason);
    if (reason === "io server disconnect") socket.connect();
  });

  socket.on("connect_error", (err) => {
    console.error("WS connection error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Manual WS Disconnect");
    socket.disconnect();
    socket = null;
  }
};
