// server.js - Full Dev + Production Ready (Unshortened)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';

// Infrastructure Imports
import connectDB from './config/db.js';
import { initIO } from './socket.js';
import { watchBtcDeposits } from './utils/btcWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import planRoutes from './routes/plan.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const __dirname = path.resolve();

// ─────────────── SECURITY & OPTIMIZATION ───────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────── CORS CONFIGURATION ───────────────

// Hardcoded allowed origins for production & dev
const defaultAllowedOrigins = [
  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'https://trustracapitaltrade-backend.onrender.com',
  'http://localhost:5173',
  'http://172.20.10.3:5173', // Local dev network IP
];

// Merge additional origins from .env
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

// Final whitelist without duplicates
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

console.log('🌐 Allowed CORS Origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Allow if in whitelist
      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.warn(`❌ CORS BLOCKED: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie'],
  })
);

// ─────────────── STATIC FILES ───────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────── API ROUTES ───────────────
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api/plans', planRoutes);

// ─────────────── PRODUCTION SPA SERVING ───────────────
if (NODE_ENV === 'production') {
  const frontendDistPath = path.resolve(__dirname, '../frontend/dist');

  // Serve static frontend assets
  app.use(express.static(frontendDistPath));

  // SPA fallback: serve index.html for all non-API GET requests
  app.get('*', (req, res, next) => {
    const apiPrefixes = ['/auth', '/user', '/admin', '/api'];

    // Skip SPA for API requests
    const isApiRoute = apiPrefixes.some((prefix) => req.path.startsWith(prefix));
    if (isApiRoute) return next();

    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

// ─────────────── ERROR HANDLER ───────────────
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('🔥 SERVER ERROR:', err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: NODE_ENV === 'production' ? null : err.stack,
  });
});

// ─────────────── SERVER STARTUP ───────────────
const startServer = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB Connected');

    // Initialize Socket.IO
    const io = initIO(httpServer, allowedOrigins);
    app.set('io', io);

    // Start server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} [${NODE_ENV}]`);

      // BTC Watcher every 5 minutes
      setInterval(async () => {
        try {
          await watchBtcDeposits(io);
        } catch (err) {
          console.error('❌ BTC WATCHER ERROR:', err.message);
        }
      }, 5 * 60 * 1000);

      // Initialize Rio Engine
      try {
        initRioEngine(io);
        console.log('⚙️ Rio Engine Running');
      } catch (err) {
        console.error('❌ RIO ENGINE ERROR:', err.message);
      }
    });
  } catch (err) {
    console.error('🔥 CRITICAL ERROR: Cannot start server', err);
    process.exit(1);
  }
};

// Start everything
startServer();
