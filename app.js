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

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

/* ---------------- Body Parsers & Logging ---------------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/* ---------------- Routes ---------------- */
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
    message: IS_PROD ? 'Internal server error' : err.message,
    stack: IS_PROD ? undefined : err.stack
  });
});

export default app;
