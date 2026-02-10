// app.js – Full Production Logic
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/error.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';
import transactionRoutes from './routes/transaction.js';
import adminRoutes from './routes/adminRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';

const app = express();

// 1. Security & Performance Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'", 
          "https://trustracapitaltrade-backend.onrender.com", 
          "wss://trustracapitaltrade-backend.onrender.com", 
          "https://api.coingecko.com" // Allows BTC Price Sync
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS – Explicitly allowing your Vercel Frontend
app.use(
  cors({
    origin: [
      'https://trustra-capital-trade.vercel.app',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors()); // Preflight

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Increased for trading dashboard activity
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 2. Health & Root Endpoints (Fixes "Not Found - /")
app.get('/', (req, res) => res.json({
  success: true,
  message: 'Trustra Capital Trade API – Secure Gateway Active (2026)',
  timestamp: new Date().toISOString()
}));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);

// 4. Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;

