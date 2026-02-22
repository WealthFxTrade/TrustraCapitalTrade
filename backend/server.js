import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import initCronJobs from './utils/cronJob.js';
import { startBtcDaemon } from './services/btcWatcher.js';

const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 🚀 Start Express first to get the server instance
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    // 📡 Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: ["https://trustra-capital-trade.vercel.app", "http://localhost:5173"],
        credentials: true
      },
      transports: ['websocket'],
    });

    // 🕒 Start Background Jobs (Passing 'io' for real-time updates)
    initCronJobs(io); 
    startBtcDaemon(5); 

    io.on('connection', (socket) => {
      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`🔒 Secure Socket: User ${userId}`);
      });
    });

    // Share 'io' globally for controllers
    app.set('socketio', io);

  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();

