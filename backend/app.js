import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */
app.use(helmet()); 
app.use(compression()); 
app.use(express.json());
app.use(morgan('dev')); // Essential: This will show you the BROKEN URL in your terminal

// CORS: Hardened for 2026 Production
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
  message: "Trustra 2026 API Active" 
}));

/**
 * MOUNTING STRATEGY
 * /api/auth/login
 * /api/user/me
 * /api/transactions/my
 */
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); 
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

/* --- 3. ERROR HANDLING --- */

// FIXED: Using backticks (`) and ${} for dynamic string interpolation
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('SERVER_CRASH:', err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

export default app;

