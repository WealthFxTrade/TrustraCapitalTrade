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

const startServer = async () => {
  try {
    // 2️⃣ Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB Connected');

    // 3️⃣ Start Cron Jobs
    initCronJobs();
    console.log('🕒 Profit Cron Job Initialized');

    // 4️⃣ Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    // 5️⃣ Graceful shutdown
    const shutdown = () => {
      console.log('🛑 Shutting down server...');
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log('✅ Connections closed. Safe to exit.');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during database close:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
};

// 6️⃣ Launch server
startServer();
