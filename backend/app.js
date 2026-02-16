// backend/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/error.js';

// ─── Route Imports ───
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/adminRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import reviewRoutes from './routes/reviews.js';
import bitcoinRoutes from './routes/bitcoin.js';

// ─── Background Workers ───
import './workers/depositScanner.js';
import './cron/profitJob.js';

const app = express();

// ─── SECURITY HEADERS ───
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://trustracapitaltrade-backend.onrender.com",
          "https://trustra-capital-trade.vercel.app",
          "https://api.coingecko.com",
          "https://eth.drpc.org"
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// ─── CORS CONFIGURATION ───
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app', // production frontend
  'http://localhost:5173',                     // local dev
  'https://trustracapitaltrade-backend.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps / curl
    if (!allowedOrigins.includes(origin)) return callback(new Error('CORS blocked: Origin not allowed'), false);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle pre-flight for all routes
app.options('*', cors());

// ─── RATE LIMITING ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Node Traffic High: Try again in 15 mins.' }
});
app.use('/api/', limiter);

// ─── GENERAL MIDDLEWARE ───
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── HEALTH CHECK ───
app.get('/', (req, res) =>
  res.json({
    success: true,
    node: 'Trustra_Secure_Gateway_v8.4.1',
    status: 'Online',
    timestamp: new Date().toISOString()
  })
);

// ─── API ROUTES ───
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdraw', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investments', investmentRoutes);

// ─── ERROR HANDLERS ───
app.use(notFound);
app.use(errorHandler);

export { app };
export default app;
