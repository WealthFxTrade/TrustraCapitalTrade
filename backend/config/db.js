// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // ✅ ensure env is loaded here

const options = {
  family: 4,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  autoIndex: process.env.NODE_ENV !== 'production',
};

let isConnected = false;

const connectDB = async (retries = 3, baseDelay = 2000) => {
  const MONGO_URI = process.env.MONGO_URI; // ✅ move INSIDE function

  if (!MONGO_URI) {
    throw new Error('❌ MONGO_URI is missing in .env');
  }

  // Fast path
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📡 [Ledger] Already connected to MongoDB');
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 [Ledger] Connecting... (attempt ${attempt}/${retries})`);

      await mongoose.connect(MONGO_URI, options);

      isConnected = true;
      console.log(`✅ [Ledger] Connected to ${mongoose.connection.host}`);

      setupEventListeners();
      return;

    } catch (error) {
      console.error(`❌ [Ledger] Attempt ${attempt} failed: ${error.message}`);

      if (attempt === retries) {
        console.error('🔥 [Ledger] All retries exhausted.');
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`🔄 [Ledger] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const setupEventListeners = () => {
  if (mongoose.connection.listenerCount('disconnected') > 0) return;

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ [Ledger] MongoDB disconnected. Reconnecting...');
    connectDB(5, 3000).catch(err =>
      console.error('[Ledger] Reconnect failed:', err.message)
    );
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ [Ledger] MongoDB error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ [Ledger] MongoDB reconnected');
  });
};

export default connectDB;
