import React, { createContext, useEffect, useRef, useState } from "react";
import { connectSocket } from "../services/socket";
import { useAuth } from "./AuthContext";

export const AdminLiveContext = createContext();

export const AdminLiveProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState(0);

  useEffect(() => {
    // 🛡️ Security: Only connect if user is Admin
    if (!user || !token) return;
    if (user.role !== "admin" && !user.isAdmin) return;

    // 🔌 Connect via your centralized socket service
    socketRef.current = connectSocket(token);
    const socket = socketRef.current;

    // Join the secure admin room
    socket.emit('join_admin_room');

    // ₿ Listen for Live BTC Deposits (from btcWatcher.js)
    socket.on("global_deposit_confirmed", (payload) => {
      setEvents((prev) => [
        { type: "DEPOSIT", timestamp: Date.now(), ...payload },
        ...prev
      ].slice(0, 100));
    });

    // 💸 Listen for New Withdrawal Requests (from withdrawalController.js)
    socket.on("admin_notification", (payload) => {
      setEvents((prev) => [
        { type: "WITHDRAWAL", timestamp: Date.now(), ...payload },
        ...prev
      ].slice(0, 100));
    });

    // 👤 Admin Presence logic
    socket.on("admin:online", (count) => {
      setOnlineAdmins(Number(count) || 0);
    });

    return () => {
      // 🧹 HARD CLEANUP
      socket.off("global_deposit_confirmed");
      socket.off("admin_notification");
      socket.off("admin:online");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  return (
    <AdminLiveContext.Provider
      value={{
        events,
        onlineAdmins,
      }}
    >
      {children}
    </AdminLiveContext.Provider>
  );
};

