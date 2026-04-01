// server.js - Trustra Capital Institutional Terminal
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';

// Protocol & Ledger Imports
import connectDB from './config/db.js';
import { initIO } from './socket.js';
import { watchBtcDeposits } from './utils/btcWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

// Route Architecture
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import planRoutes from './routes/plan.js';

// ── CONFIGURE ENVIRONMENT ──
dotenv.config({ path: './.env' }); // Ensure .env loads in all environments

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const __dirname = path.resolve();

// ── SECURITY & PERFORMANCE MIDDLEWARE ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── FULL CORS SUPPORT FROM .ENV ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    // Authorize if in whitelist
    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.error("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error('Origin Unauthorized by Governance'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie'],
}));

// ── API ENDPOINT ROUTING ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);

// ── PRODUCTION SPA HANDLER ──
if (NODE_ENV === 'production') {
  const frontendPath = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    success: false,
    message: `Terminal Anomaly: ${err.message}`,
    protocol: "X-TRUSTRA-ERR-400"
  });
});

// ── TERMINAL BOOT SEQUENCE ──
const bootTerminal = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Socket.IO
    const io = initIO(httpServer, allowedOrigins);
    app.set('io', io);

    // Start HTTP server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TERMINAL ONLINE | PORT: ${PORT}`);
      
      // Start Quantitative ROI Engine
      initRioEngine(io);

      // Periodic BTC deposits watcher (every 5 minutes)
      setInterval(() => watchBtcDeposits(io), 5 * 60 * 1000);
    });
  } catch (err) {
    console.error('🔥 CRITICAL SYSTEM FAILURE:', err);
    process.exit(1);
  }
};

bootTerminal();
