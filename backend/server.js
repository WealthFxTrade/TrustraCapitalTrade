// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// ── ROUTES ──
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import transactionsRoutes from './routes/transactions.js';
import depositRoutes from './routes/depositRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import bitcoinRoutes from './routes/bitcoin.js';
import reviewsRoutes from './routes/reviews.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';

// ── MIDDLEWARE ──
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ── CORS CONFIGURATION ──
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'https://trustracapitaltrade-backend.onrender.com',
  'https://www.trustracapitaltrade.online',
  'https://trustracapitaltrade.online',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    credentials: true, // Enable sending cookies
  })
);

// ── GLOBAL MIDDLEWARE ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev')); // HTTP request logging

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});

// ── API ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

// ── ERROR HANDLING ──
app.use(errorHandler);

// ── DATABASE CONNECTION ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trustra';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
      console.log(`Allowed Origins for CORS: ${allowedOrigins.join(', ')}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚡ Running in DEVELOPMENT mode');
      }
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ── HANDLE UNCAUGHT EXCEPTIONS ──
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});
