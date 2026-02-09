// 1️⃣ Load environment variables first
import dotenv from 'dotenv';
dotenv.config();  // ensures process.env is populated

import mongoose from 'mongoose';
import app from './app.js';
import initCronJobs from './utils/cronJob.js';

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

let isShuttingDown = false;  // Flag to prevent multiple shutdowns

const startServer = async () => {
  try {
    // 2️⃣ Connect to MongoDB – improved options
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 20,                    // ↑ Slightly higher; safe for most apps
      minPoolSize: 5,                     // Keep a few warm connections
      serverSelectionTimeoutMS: 15000,    // 15s – balances Atlas election time + latency
      socketTimeoutMS: 45000,             // Optional: close idle sockets after 45s
      family: 4,                          // Optional: prefer IPv4 on some hosts
    });
    console.log('✅ MongoDB Connected');

    // 3️⃣ Start Cron Jobs (after DB is ready)
    initCronJobs();
    console.log('🕒 Profit Cron Job Initialized');

    // 4️⃣ Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // 5️⃣ Graceful shutdown with timeout
    const shutdown = (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`🛑 Received ${signal}. Shutting down gracefully...`);

      // Stop accepting new connections
      server.close(async () => {
        console.log('   → HTTP server closed (no new connections)');

        try {
          await mongoose.connection.close();
          console.log('   → MongoDB connection closed');
          console.log('✅ Safe to exit.');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error closing DB:', err.message);
          process.exit(1);
        }
      });

      // Force exit after 15s if shutdown hangs
      setTimeout(() => {
        console.error('❌ Graceful shutdown timed out – forcing exit');
        process.exit(1);
      }, 15000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));   // Ctrl+C

    // Optional: Catch unhandled rejections (prevent silent crashes)
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Optionally shutdown gracefully
      shutdown('unhandledRejection');
    });

  } catch (err) {
    console.error('❌ Startup Error:', err.stack || err.message);
    process.exit(1);
  }
};

// 6️⃣ Launch server
startServer();
