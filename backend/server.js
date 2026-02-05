// 1. MUST BE FIRST: Load environment variables before any other imports
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

/**
 * Server Startup Logic
 */
const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your Environment Variables.");
    }

    // Connect to MongoDB with optimized settings
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000 
    });

    console.log('✅ MongoDB Connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    /* --- Graceful Shutdown (Fixed for Node v25/Mongoose 8+) --- */
    const shutdown = () => {
      console.log('🛑 Shutting down server...');
      server.close(async () => {
        try {
          // FIXED: .close() no longer accepts callbacks. Use await or .then()
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

