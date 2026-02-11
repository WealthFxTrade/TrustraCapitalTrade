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
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/adminRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js'; // ✅ NEW

// Import cron job (runs automatically)
import './cron/profitJob.js'; // ✅ NEW

const app = express();

// ───────────── SECURITY MIDDLEWARE ─────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://trustracapitaltrade-backend.onrender.com",
          "https://trustra-capital-trade.vercel.app",
          "wss://trustracapitaltrade-backend.onrender.com",
          "https://api.coingecko.com"
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ───────────── CORS ─────────────
app.use(cors({
  origin: [
    'https://trustra-capital-trade.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ───────────── RATE LIMITER ─────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ───────────── GENERAL MIDDLEWARE ─────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ───────────── HEALTH CHECK ─────────────
app.get('/', (req, res) => res.json({
  success: true,
  message: 'Trustra Capital Trade API – Secure Gateway Active (2026)',
  timestamp: new Date().toISOString()
}));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ───────────── ROUTES ─────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investments', investmentRoutes); // ✅ NEW

// ───────────── ERROR HANDLERS ─────────────
app.use(notFound);
app.use(errorHandler);

export { app };
export default app;
