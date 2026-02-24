import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Config & Middleware
import { validateEnv } from './config/validateEnv.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// ── ALL ROUTES FROM YOUR DIRECTORY ──
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import marketRoutes from './routes/market.js';
import investmentRoutes from './routes/investmentRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import transactionRoutes from './routes/transactions.js';
import bitcoinRoutes from './routes/bitcoin.js';
import planRoutes from './routes/plan.js';
import reviewRoutes from './routes/reviews.js';

// Services
import initCronJobs from './utils/cronJob.js';
import { startBtcDaemon } from './services/btcWatcher.js';

validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT, 10) || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── CORS SETUP ──
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL, // Set this to https://trustra-capital-trade.vercel.app in Render
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173'
];

function isAllowedOrigin(origin) {
  if (!origin) return true; 
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
}

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ── MIDDLEWARE ──
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// ── API ENDPOINTS ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'online', env: process.env.NODE_ENV });
});

// ── ERROR HANDLING ──
app.use(notFound);
app.use(errorHandler);

// ── SERVER & SOCKETS ──
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    const io = new Server(server, {
      cors: {
        origin: (origin, cb) => {
          if (isAllowedOrigin(origin)) return cb(null, true);
          return cb(new Error('Socket CORS rejected'));
        },
        credentials: true
      }
    });

    // Socket Auth
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Auth required'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      socket.join(socket.userId);
      if (socket.userRole === 'admin') socket.join('admin_room');
    });

    app.set('socketio', io);
    initCronJobs(io);
    startBtcDaemon(10);

  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

