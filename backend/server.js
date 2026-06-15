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
import { Server } from 'socket.io';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/* ================= SECURITY ================= */
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false, // keep safe if frontend uses external scripts
  })
);

/* ================= RATE LIMIT ================= */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
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

/* ================= MIDDLEWARE ================= */
app.use(compression());
app.use(express.json({ limit: '1mb' })); // FIX: 10mb is too risky for auth APIs
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= SAFE TIMEOUT MIDDLEWARE ================= */
const requestTimeout = (ms = 90000) => (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.warn(`⏰ Timeout: ${req.method} ${req.originalUrl}`);

      res.status(408).json({
        success: false,
        message: 'Request timeout. Please try again.',
      });
    }
  }, ms);

  res.on('finish', () => clearTimeout(timer));
  next();
};

app.use(requestTimeout(90000));

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ================= CORS (FIXED + SAFE EXPLICIT WHITELIST) ================= */
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow server-to-server or development testing tools like Postman
  return allowedOrigins.includes(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false); // Avoid crashing server, explicitly deny unknown sources
    },
    credentials: true,
  })
);

app.options('*', cors());

/* ================= SOCKET.IO (FIXED CORS MATCH) ================= */
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    const id = String(userId || '').trim();

    if (mongoose.Types.ObjectId.isValid(id)) {
      socket.join(id);
    }
  });
});

app.set('io', io);

/* ================= ROUTES ================= */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

/* ================= HEALTH CHECK ================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ================= ROOT ROUTE ================= */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Trustra Capital API Running',
    health: '/api/health',
  });
});

/* ================= ERROR HANDLERS ================= */
app.use(notFound);
app.use(errorHandler);

/* ================= START SERVER ================= */
const startServer = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await connectDB();

    server.timeout = 120000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 70000;
    server.requestTimeout = 90000;

    server.listen(PORT, () => {
      console.log('====================================');
      console.log('🚀 Trustra Capital Backend Started');
      console.log('====================================');
      console.log(`✅ Running on port ${PORT} [${NODE_ENV}]`);
      console.log('🔗 Health Check: /api/health');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

/* ================= GRACEFUL SHUTDOWN ================= */
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');

  try {
    await mongoose.connection.close();
    console.log('🟡 MongoDB closed');
  } catch (err) {
    console.error('MongoDB close error:', err.message);
  }

  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});
