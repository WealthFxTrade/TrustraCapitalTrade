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

// Config
import { validateEnv } from './config/validateEnv.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import marketRoutes from './routes/market.js';
import adminRoutes from './routes/adminRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';

// Services
import initCronJobs from './utils/cronJob.js';
import { startBtcDaemon } from './services/btcWatcher.js';

// ──────────────────────────────────────────────
// VALIDATE ENVIRONMENT
// ──────────────────────────────────────────────

validateEnv();

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT, 10) || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Vercel preview branches
const ORIGIN_REGEX = /^https:\/\/.*\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow non-browser requests (curl, mobile)
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (ORIGIN_REGEX.test(origin)) return true;
  return false;
}

// ──────────────────────────────────────────────
// EXPRESS APP
// ──────────────────────────────────────────────

const app = express();

// ── Security ──
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

// ── Rate Limiting ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 500 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── General Middleware ──
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// ── Health Check ──
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'online',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// ── Frontend Static Serving (Production Only) ──
if (IS_PROD) {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  // SPA fallback — only for non-API routes
  app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) return res.status(404).json({ message: 'API route not found' });
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Error Handlers ──
app.use(notFound);
app.use(errorHandler);

// ──────────────────────────────────────────────
// SERVER STARTUP
// ──────────────────────────────────────────────

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 2. Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`);
    });

    // 3. Socket.IO
    const io = new Server(server, {
      cors: {
        origin: (origin, cb) => {
          if (isAllowedOrigin(origin)) return cb(null, true);
          return cb(new Error('Socket CORS rejected'));
        },
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Socket authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
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
      // Auto-join user's private room (verified by JWT above)
      socket.join(socket.userId);
      console.log(`🔒 Socket connected: ${socket.userId}`);

      // Admin room — only if role is admin
      socket.on('join_admin_room', () => {
        if (socket.userRole === 'admin') {
          socket.join('admin_room');
          console.log('🛡️ Admin joined admin_room');
        }
      });

      socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${socket.userId} (${reason})`);
      });
    });

    // Make io accessible to routes/controllers
    app.set('socketio', io);

    // 4. Background Jobs
    initCronJobs(io);
    startBtcDaemon(10);

    // 5. Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);

      server.close(() => {
        console.log('HTTP server closed');
      });

      io.close();

      try {
        await mongoose.connection.close();
        console.log('MongoDB disconnected');
      } catch (err) {
        console.error('Error closing MongoDB:', err.message);
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

startServer();
