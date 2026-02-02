// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';
import depositRoutes from './routes/deposit.js';

// Jobs
import './jobs/depositWatcher.js'; // starts automatically

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 10000;

// ──────────────────────────────
// Middleware
// ──────────────────────────────
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, try later.' },
  })
);

const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ──────────────────────────────
// Routes
// ──────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/deposits', depositRoutes);

// Health check
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(mongoStatus === 'connected' ? 200 : 503).json({
    status: 'ok',
    mongo: mongoStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    api: 'TrustraCapitalTrade Backend',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Unexpected error';
  res.status(status).json({ success: false, message });
});

// ──────────────────────────────
// MongoDB Connection
// ──────────────────────────────
const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected');
      console.log('Database:', mongoose.connection.name);
      return;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
};

// ──────────────────────────────
// Start server
// ──────────────────────────────
let server;

(async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS allowed: ${allowedOrigins.join(', ')}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Local URL: http://localhost:${PORT}`);
      }
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received — shutting down gracefully`);

      if (server) {
        server.close(() => console.log('HTTP server closed'));
      }

      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
})();
