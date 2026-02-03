// backend/server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js'; // This imports all the middleware and routes from your app.js

dotenv.config();

// We use 10001 because port 10000 was blocked in your Termux session earlier
const PORT = process.env.PORT || 10001; 

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');

    // Binding to 0.0.0.0 is essential for Termux to be accessible on your network
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Handle crashes gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

startServer();

