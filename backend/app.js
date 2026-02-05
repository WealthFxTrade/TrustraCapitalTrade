import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports
import userRoutes from './routes/user.js'; 
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' })); 
app.use(morgan('dev'));

// CORS: Hardened for Vercel & Preview Deploys
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

// Health Check
app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active",
  timestamp: new Date().toISOString()
}));

/**
 * DOUBLE MOUNTING STRATEGY:
 * Since your frontend calls two different base paths that both 
 * exist in our 'user.js' file, we mount it twice.
 */

// 1. Handles /api/user/balance, /api/user/login, /api/user/register
app.use('/api/user', userRoutes); 

// 2. Handles /api/transactions/my (Inside user.js it is router.get('/transactions/my'))
app.use('/api', userRoutes); 

app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

/* --- 3. ERROR HANDLING --- */

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use(errorHandler);

export default app;

