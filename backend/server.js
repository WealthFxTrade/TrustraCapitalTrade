// 1. MUST BE FIRST: Load environment variables
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import initCronJobs from './utils/cronJob.js'; // <--- ADD THIS IMPORT

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined.");
    }

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB Connected');

    // 2. START THE PROFIT ENGINE (After DB connection)
    initCronJobs(); 
    console.log('🕒 Profit Cron Job Initialized');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

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

startServer();

