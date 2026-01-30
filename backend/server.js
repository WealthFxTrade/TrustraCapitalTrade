// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import helmet from 'helmet'; // added security headers
import rateLimit from 'express-rate-limit'; // added global rate limiting

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ──────────────────────────────────────────────
//  Critical environment checks (fail fast)
// ──────────────────────────────────────────────
if (!MONGO_URI) {
  console.error('CRITICAL: MONGO_URI is not set in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// ──────────────────────────────────────────────
//  Middleware
// ──────────────────────────────────────────────

// Security headers
app.use(helmet());

// Trust proxy (important on Render, Vercel, Cloudflare, etc.)
app.set('trust proxy', 1);

// Rate limiting (protect against brute-force & DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,                 // limit each IP to 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// CORS - strict origin check
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Body parsers with size limits (prevent DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('dev')); // 'combined' in production if needed

// ──────────────────────────────────────────────
//  Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint (useful for Render/Vercel)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TrustraCapitalTrade Backend API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot \( {req.method} \){req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ──────────────────────────────────────────────
//  MongoDB connection with retry logic
// ──────────────────────────────────────────────
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      });
      console.log('MongoDB connected successfully');
      break;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection failed (attempt \( {retries}/ \){maxRetries}):`, err.message);
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s backoff
    }
  }
};

connectDB();

// ──────────────────────────────────────────────
//  Start server
// ──────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

// ──────────────────────────────────────────────
//  Graceful shutdown
// ──────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`${signal} received - shutting down gracefully`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
