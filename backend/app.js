// app.js – Production-ready Express application (ESM)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/error.js'; // create this file if missing

// Route imports (all must export default router)
import authRoutes           from './routes/auth.js';
import userRoutes           from './routes/userRoutes.js';
import planRoutes           from './routes/plan.js';
import marketRoutes         from './routes/market.js';
import transactionRoutes    from './routes/transaction.js';
import adminRoutes          from './routes/adminRoutes.js';
import walletRoutes         from './routes/walletRoutes.js';
import withdrawalRoutes     from './routes/withdrawalRoutes.js';

// Initialize Express app
const app = express();

// ────────────────────────────────────────────────
// 1. Security & Performance Middleware
// ────────────────────────────────────────────────

// Helmet – strict CSP (customize as needed)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // relax if needed for frontend
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.trustracapital.trade'],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Rate limiting – prevent brute-force & DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                 // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Compression, JSON parsing, logging
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan logging – concise in prod, detailed in dev
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.url === '/health' || req.url === '/',
  })
);

// CORS – very strict in production
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'https://trustra-capital-trade.vercel.app',
        process.env.NODE_ENV !== 'production' && 'http://localhost:5173',
        process.env.NODE_ENV !== 'production' && 'http://127.0.0.1:5173',
      ].filter(Boolean);

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// Preflight OPTIONS
app.options('*', cors());

// ────────────────────────────────────────────────
// 2. Health & Root Endpoints
// ────────────────────────────────────────────────

app.get('/health', (req, res) => res.status(200).json({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
}));

app.get('/', (req, res) => res.json({
  success: true,
  message: 'Trustra Capital Trade API – Secure Gateway Active (2026)',
  version: '1.0.0',
  env: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
}));

// ────────────────────────────────────────────────
// 3. API Routes
// ────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);

// ────────────────────────────────────────────────
// 4. Error Handling (last middleware)
// ────────────────────────────────────────────────

// 404 – Not Found
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
