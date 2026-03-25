// server.js - FINAL CORRECTED VERSION WITH PROPER ADMIN HEALTH ROUTE
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import http from 'http';

import connectDB from './config/db.js';
import { watchBtcDeposits } from './utils/btcWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const httpServer = createServer(app);

// ── CORS CONFIG ─────────────────────────────────────────────
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[CORS BLOCKED] ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── SOCKET.IO ───────────────────────────────────────────────
const io = new Server(httpServer, { 
  cors: { origin: allowedOrigins, credentials: true } 
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[SOCKET] Connected: ${socket.id}`);
  socket.on('join_room', (userId) => {
    if (userId) socket.join(userId);
  });
  socket.on('disconnect', () => console.log(`[SOCKET] Disconnected: ${socket.id}`));
});

// ── PUBLIC KEEP-ALIVE PING ──────────────────────────────────
app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is alive ✅',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── PUBLIC HEALTH CHECK (for Render keep-alive) ─────────────
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Trustra server is running normally'
  });
});

// ── ROUTES ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 HANDLER ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── GLOBAL ERROR HANDLER ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// ── ENGINES ─────────────────────────────────────────────────
const startEngines = async () => {
  try {
    console.log('Starting Trustra Engines...');
    
    // BTC Watcher every 5 minutes
    setInterval(() => {
      watchBtcDeposits(io).catch(err => console.error('[BTC WATCHER ERROR]', err));
    }, 5 * 60 * 1000);

    await initRioEngine(io);
    console.log('RIO Engine initialized');
    console.log('All engines active ✓');
  } catch (err) {
    console.error('[ENGINE ERROR]', err);
  }
};

// ── SELF-PING ───────────────────────────────────────────────
const SELF_PING_INTERVAL = 10 * 60 * 1000;

setInterval(() => {
  const url = `http://localhost:${PORT}/ping`;
  http.get(url, (res) => {
    console.log(`[SELF-PING] Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[SELF-PING ERROR]', err.message);
  });
}, SELF_PING_INTERVAL);

// ── KEEP-ALIVE PING (now uses public /ping) ─────────────────
setInterval(() => {
  http.get(`http://localhost:${PORT}/ping`, res => {
    console.log(`[KEEP-ALIVE] Status: ${res.statusCode}`);
  }).on('error', err => console.error('[KEEP-ALIVE ERROR]', err));
}, 4 * 60 * 1000);

// ── START SERVER ────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ Keep-alive endpoint: /ping`);
      startEngines();
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
};

startServer();

// ── GRACEFUL SHUTDOWN ───────────────────────────────────────
process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));
process.on('SIGINT', () => process.exit(0));
