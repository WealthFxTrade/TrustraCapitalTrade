import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, { maxPoolSize: 10 });
    console.log('✅ MongoDB Connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Backend running on port ${PORT}`);
    });

    process.on('SIGTERM', () => server.close());
    process.on('SIGINT', () => server.close());

  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();
