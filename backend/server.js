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
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    initCronJobs();
    console.log('🕒 Profit Cron Job Initialized');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    // Socket.io setup
    const io = new Server(server, {
      cors: {
        origin: [
          'https://trustra-capital-trade.vercel.app',
          'http://localhost:5173'
        ],
        credentials: true
      },
      transports: ['websocket']
    });

    io.on('connection', (socket) => {
      console.log(`📡 Socket Connected: ${socket.id}`);
      socket.on('disconnect', () => console.log(`🔌 Socket Disconnected: ${socket.id}`));
    });

    // Share io instance globally if needed
    app.set('socketio', io);

  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();
