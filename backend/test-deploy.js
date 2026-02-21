import { io } from "socket.io-client";
import fetch from "node-fetch";

const URL = "http://localhost:10000";

async function verify() {
  console.log("🔍 Checking Health Endpoint...");
  try {
    const res = await fetch(`${URL}/health`);
    const data = await res.json();
    console.log("✅ API Status:", data.status, "| Node:", data.node);
  } catch (e) {
    console.error("❌ API Offline");
  }

  console.log("🔍 Checking Socket Connection...");
  const socket = io(URL, { transports: ['websocket'] });
  socket.on("connect", () => {
    console.log("✅ Socket Connected! ID:", socket.id);
    socket.disconnect();
    process.exit(0);
  });
}

verify();

