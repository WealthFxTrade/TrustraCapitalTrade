// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Fail fast if critical env vars are missing
if (!MONGO_URI) {
  console.error('CRITICAL: MONGO_URI not set');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET not set');
  process.exit(1);
}

// Middleware
app.use(helmet());
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
});
app.use(limiter);

app.use(cors({
  origin: ['https://trustra-capital-trade.vercel.app', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// MongoDB connection with retry
const connectDB = async () => {
  let retries = 0;
  while (retries < 5) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection failed (attempt ${retries}/5):`, err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  console.error('MongoDB connection failed after 5 attempts');
  process.exit(1);
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
