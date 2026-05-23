// config/db.js
import mongoose from 'mongoose';

const options = {
  family: 4,
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
  retryWrites: true,
  autoIndex: process.env.NODE_ENV !== 'production',
};

let isConnected = false;

const connectDB = async (retries = 5, baseDelay = 3000) => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📡 Already connected to MongoDB');
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log('====================================');
      console.log('📡 MongoDB Connection Attempt');
      console.log('====================================');

      console.log(`📡 [Ledger] Connecting... (${attempt}/${retries})`);

      await mongoose.connect(MONGO_URI, options);

      isConnected = true;

      console.log('====================================');
      console.log('✅ MongoDB Connected Successfully');
      console.log('====================================');

      console.log(`🌐 Host: ${mongoose.connection.host}`);

      setupEventListeners();

      return;
    } catch (error) {
      console.error('====================================');
      console.error('❌ MongoDB Connection Failed');
      console.error('====================================');

      console.error(`Attempt ${attempt} failed`);
      console.error(error.message);

      if (attempt === retries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);

      console.log(`⏳ Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const setupEventListeners = () => {
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ MongoDB disconnected. Reconnecting...');
    connectDB().catch(console.error);
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
  });
};

export default connectDB;
