// backend/server.js

import './env.js';

import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

/**
 * =========================
 * DATABASE CONNECTION
 * (your improved retry DB file)
 * =========================
 */
import connectDB from './config/db.js';

/**
 * =========================
 * ROUTES
 * =========================
 */
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

/**
 * =========================
 * PATH SETUP
 * =========================
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * =========================
 * APP + SERVER
 * =========================
 */
const app = express();
const server = http.createServer(app);

/**
 * =========================
 * ENV
 * =========================
 */
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * =========================
 * SECURITY
 * =========================
 */
app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);

/**
 * =========================
 * RATE LIMITERS
 * =========================
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  },
});

app.use(globalLimiter);

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

/**
 * =========================
 * CORS CONFIG
 * =========================
 */
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',

  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'https://trustracapitaltrade-backend.onrender.com',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  if (
    origin.startsWith('http://192.168.') ||
    origin.startsWith('http://172.') ||
    origin.startsWith('http://10.')
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.options('*', cors());

/**
 * =========================
 * SOCKET.IO
 * =========================
 */
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Socket CORS blocked'));
    },
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      socket.join(userId.toString());
    }
  });
});

app.set('io', io);

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
    env: NODE_ENV,
  });
});

/**
 * =========================
 * ERROR HANDLER
 * =========================
 */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

/**
 * =========================
 * START SERVER (FIXED)
 * =========================
 */
const startServer = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');

    await connectDB();

    console.log('🚀 Starting HTTP server...');

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(
        `🔗 Health: http://localhost:${PORT}/health`
      );
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

/**
 * =========================
 * SAFE SHUTDOWN
 * =========================
 */
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');

  await mongoose.connection.close();

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
