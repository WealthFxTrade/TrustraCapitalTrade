import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports
import userRoutes from './routes/user.js'; // Consolidated Auth, Balance, & Transactions
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';

// Error Handler
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */
app.use(helmet()); 
app.use(compression()); 
app.use(express.json({ limit: '10kb' })); 
app.use(morgan('dev')); 

// CORS Configuration - Hardened for 2026 Production
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

/**
 * Health Check
 * Used by Render.com to verify deployment is successful.
 */
app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active",
  timestamp: new Date().toISOString()
}));

/**
 * MOUNTING STRATEGY:
 * We mount userRoutes at '/api/user' to satisfy the dashboard paths:
 * POST /api/user/register
 * POST /api/user/login
 * GET  /api/user/balance
 * GET  /api/user/transactions/my
 */
app.use('/api/user', userRoutes); 

app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

/* --- 3. ERROR HANDLING --- */

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Custom Global Error Handler (MUST BE LAST)
app.use(errorHandler);

export default app;

