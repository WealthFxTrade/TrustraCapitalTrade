import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  // Prevent duplicate connections or connecting without a token
  if (!token) return null;
  if (socket?.connected) return socket;

  // Use your production Render URL as the fallback
  const SOCKET_URL = import.meta.env.VITE_WS_URL || "https://trustracapitaltrade-backend.onrender.com";

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"], // Required for Render performance
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    // Add this to ensure CORS/Credentials match your Axios setup
    withCredentials: true 
  });

  socket.on("connect", () => {
    console.log("🟢 Trustra WS connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("🔴 Trustra WS disconnected:", reason);
    if (reason === "io server disconnect") {
      // The server forced the disconnection, try reconnecting manually
      socket.connect();
    }
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

