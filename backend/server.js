// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';

import { watchBtcDeposits } from './utils/btcWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ── CORS CONFIG ─────────────────────────────────────────────
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS BLOCKED] ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── SOCKET.IO ───────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: corsOptions,   // Reuse the same clean CORS options
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[SOCKET] Connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`[SOCKET] User ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Disconnected: ${socket.id}`);
  });
});

// ── ROUTES ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// ── HEALTH CHECK ────────────────────────────────────────────
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ── GLOBAL ERROR HANDLER ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── ENGINES ─────────────────────────────────────────────────
const startEngines = async () => {
  try {
    console.log('Starting Trustra Engines...');

    // BTC Watcher every 5 minutes
    setInterval(() => {
      watchBtcDeposits(io).catch(err => {
        console.error('[BTC WATCHER ERROR]', err);
      });
    }, 5 * 60 * 1000);

    await initRioEngine(io);

    console.log('RIO Engine initialized');
    console.log('All engines active ✓');
  } catch (err) {
    console.error('[ENGINE ERROR]', err);
  }
};

// ── START SERVER ────────────────────────────────────────────
const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startEngines();
    });

  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
};

startServer();

// ── GRACEFUL SHUTDOWN ───────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received - shutting down...');
  process.exit(0);
});
