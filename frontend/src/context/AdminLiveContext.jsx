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
    if (!user || !token) return;
    if (user.role !== "admin" && user.role !== "superadmin") return;

    // 🔌 Connect once
    socketRef.current = connectSocket(token);
    const socket = socketRef.current;

    socket.on("admin:balance:update", (payload) => {
      setEvents((prev) =>
        [{ type: "balance", timestamp: Date.now(), ...payload }, ...prev].slice(0, 100)
      );
    });

    socket.on("admin:transaction:new", (payload) => {
      setEvents((prev) =>
        [{ type: "transaction", timestamp: Date.now(), ...payload }, ...prev].slice(0, 100)
      );
    });

    socket.on("admin:online", (count) => {
      setOnlineAdmins(Number(count) || 0);
    });

    return () => {
      // 🧹 HARD CLEANUP (important)
      socket.off("admin:balance:update");
      socket.off("admin:transaction:new");
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
