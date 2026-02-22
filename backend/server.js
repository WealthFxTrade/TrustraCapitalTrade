import dotenv from 'dotenv';
dotenv.config();
import express from 'express'; // Fixed: Added missing import
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import initCronJobs from './utils/cronJob.js';
import { startBtcDaemon } from './services/btcWatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 🚀 SERVE FRONTEND (Only in Production)
    if (process.env.NODE_ENV === 'production') {
      const distPath = path.join(__dirname, '../frontend/dist');
      app.use(express.static(distPath));
      
      // Handle React Routing (SPAs)
      app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    // 📡 Socket.io Initialization
    const io = new Server(server, {
      cors: {
        origin: ["https://trustra-capital-trade.vercel.app", "http://localhost:5173"],
        credentials: true
      },
      transports: ['websocket'],
    });

    // 🕒 Background Jobs
    initCronJobs(io);
    startBtcDaemon(10); 

    io.on('connection', (socket) => {
      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`🔒 Secure Socket: User ${userId}`);
      });
      socket.on('join_admin_room', () => {
        socket.join('admin_room');
        console.log(`🛡️ Admin Connected`);
      });
    });

    app.set('socketio', io);

  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();

