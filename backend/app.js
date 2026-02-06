import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';
import transactionRoutes from './routes/transaction.js'; // 1. IMPORT THIS

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://trustra-capital-trade.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Trustra Security (CORS)'));
    }
  },
  credentials: true
}));

/* --- 2. API ROUTE MOUNTING --- */

app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active"
}));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);    
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes); // 2. MOUNT THIS

/* --- 3. ERROR HANDLING --- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[SERVER_ERROR] ${statusCode}:`, err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;

