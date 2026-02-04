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
    // Fail fast if the URI is missing to avoid the Mongoose "undefined" error
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your Render Environment Variables.");
    }

    // Connect to MongoDB with optimized settings
    await mongoose.connect(MONGO_URI, { 
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
    });
    
    console.log('✅ MongoDB Connected');

    // Bind to 0.0.0.0 for Render compatibility
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    /* --- Graceful Shutdown --- */
    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('Connections closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    // Exit with failure
    process.exit(1);
  }
};

startServer();

