// backend/server.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import initCronJobs from './utils/cronJob.js';

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      autoIndex: true
    });
    console.log('✅ MongoDB Connected: Cluster Synchronized');

    // 2️⃣ Start Cron Jobs
    initCronJobs();
    console.log('🕒 Profit Cron Job Initialized: Daily ROI Drops Active');

    // 3️⃣ Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    // 4️⃣ Initialize Socket.io
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: [
          'https://trustra-capital-trade.vercel.app',
          'http://localhost:5173',
          'http://127.0.0.1:5173'
        ],
        credentials: true
      },
      transports: ['websocket'],
    });

    io.on('connection', (socket) => {
      console.log(`📡 Socket Connected: ${socket.id}`);

      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`🔒 User ${userId} secured in private socket room`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket Disconnected: ${socket.id}`);
      });
    });

    // 5️⃣ Share Socket.io globally
    app.set('socketio', io);

    // 6️⃣ Initialize Deposit Scanner last
    import('./workers/depositScanner.js').then(() => {
      console.log('💰 Deposit Scanner Initialized');
    });

  } catch (err) {
    console.error('❌ Critical Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();
