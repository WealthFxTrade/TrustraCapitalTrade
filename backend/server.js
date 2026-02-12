import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import initCronJobs from './utils/cronJob.js';

// ✅ CRITICAL FIX: Explicitly import the scanner to start the blockchain audit
import './workers/depositScanner.js'; 

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

/**
 * 🚀 Trustra Enterprise Gateway v8.4.1
 * Initializing Secure Handshake with MongoDB and Blockchain Oracles
 */
const startServer = async () => {
  try {
    // 1. Establish Database Tunnel
    await mongoose.connect(MONGO_URI, {
      autoIndex: true, // Standard for 2026 high-speed indexing
    });
    console.log('✅ MongoDB Connected: Cluster Synchronized');

    // 2. Initialize Profit Distribution Engine
    initCronJobs();
    console.log('🕒 Profit Cron Job Initialized: Daily ROI Drops Active');

    // 3. Bind to Network Interface
    // Using '0.0.0.0' allows ://render.com to route external traffic
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    // 4. Socket.io Real-Time Protocol Setup
    const io = new Server(server, {
      pingTimeout: 60000, // Handle 2026 mobile network latency
      cors: {
        origin: [
          'https://trustra-capital-trade.vercel.app',
          'http://localhost:5173',
          'http://127.0.0.1:5173'
        ],
        credentials: true
      },
      transports: ['websocket'] // Forced websocket for speed
    });

    // 5. Handle Live Node Connections
    io.on('connection', (socket) => {
      console.log(`📡 Socket Connected: ${socket.id}`);
      
      // Allow users to join a private room based on their User ID
      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`🔒 User ${userId} secured in private socket room`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket Disconnected: ${socket.id}`);
      });
    });

    // 6. Global Access: Share IO instance with Controllers
    // This allows your DepositScanner to send real-time alerts
    app.set('socketio', io);

  } catch (err) {
    console.error('❌ Critical Startup Error:', err.message);
    // 2026 Protocol: Exit with failure code to trigger auto-restart on Render/PM2
    process.exit(1);
  }
};

startServer();

