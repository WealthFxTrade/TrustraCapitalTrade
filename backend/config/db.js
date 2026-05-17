// config/db.js

import mongoose from 'mongoose';

const options = {
  family: 4,

  serverSelectionTimeoutMS: 30000,

  socketTimeoutMS: 45000,

  connectTimeoutMS: 30000,

  maxPoolSize: 10,

  retryWrites: true,

  autoIndex: process.env.NODE_ENV !== 'production',
};

let isConnected = false;

const connectDB = async (
  retries = 5,
  baseDelay = 3000
) => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error(
      '❌ MONGO_URI is missing in environment'
    );
  }

  if (
    isConnected &&
    mongoose.connection.readyState === 1
  ) {
    console.log(
      '📡 [Ledger] Already connected to MongoDB'
    );

    return;
  }

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    try {
      console.log(
        `📡 [Ledger] Connecting... (${attempt}/${retries})`
      );

      await mongoose.connect(
        MONGO_URI,
        options
      );

      isConnected = true;

      console.log(
        `✅ [Ledger] Connected: ${mongoose.connection.host}`
      );

      setupEventListeners();

      return;
    } catch (error) {
      console.error(
        `❌ [Ledger] Attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === retries) {
        console.error(
          '🔥 [Ledger] All connection retries failed.'
        );

        throw error;
      }

      const delay =
        baseDelay * Math.pow(2, attempt - 1);

      console.log(
        `🔄 [Ledger] Retrying in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }
};

const setupEventListeners = () => {
  if (
    mongoose.connection.listenerCount(
      'disconnected'
    ) > 0
  ) {
    return;
  }

  mongoose.connection.on(
    'disconnected',
    () => {
      isConnected = false;

      console.warn(
        '⚠️ [Ledger] MongoDB disconnected.'
      );

      connectDB().catch((err) =>
        console.error(
          '❌ Reconnect failed:',
          err.message
        )
      );
    }
  );

  mongoose.connection.on(
    'reconnected',
    () => {
      isConnected = true;

      console.log(
        '✅ [Ledger] MongoDB reconnected'
      );
    }
  );

  mongoose.connection.on(
    'error',
    (err) => {
      console.error(
        '❌ [Ledger] MongoDB error:',
        err.message
      );
    }
  );
};

export default connectDB;
