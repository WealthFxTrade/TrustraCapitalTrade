// backend/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Route imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';
import depositRoutes from './routes/deposit.js';

const app = express();
const IS_PROD = process.env.NODE_ENV === 'production';

/* ---------------- Security & Performance ---------------- */
app.use(helmet());
app.use(compression());
app.disable('x-powered-by');

// Rate limiter: 150 requests per 15 min
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { success: false, message: 'Too many requests, try later.' },
}));

/* ---------------- CORS (Fixed for Vercel) ---------------- */
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow if no origin (like server-to-server or Postman)
    // 2. Allow if in explicit whitelist
    // 3. Allow if it's any Vercel preview or production deployment
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ---------------- Body Parsers & Logging ---------------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/* ---------------- Routes ---------------- */
// Root Route to verify API is live
app.get('/', (req, res) => {
  res.json({ success: true, message: "Trustra Capital API Active" });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/deposits', depositRoutes);

/* ---------------- Health Check ---------------- */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/* ---------------- 404 Handler ---------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

/* ---------------- Global Error Handler ---------------- */
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: IS_PROD ? 'Internal server error' : err.message
  });
});

export default app;

