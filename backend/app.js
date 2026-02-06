import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js'; // Ensure this matches your filename
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */
app.use(helmet());
app.use(compression());
app.use(express.json()); // Parses incoming JSON for PUT requests
app.use(morgan('dev'));  // Logs: PUT /api/user/me 200

// CORS: Hardened for your Vercel frontend
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
 * Because your userRoutes.js uses paths like router.route('/user/me'),
 * we mount the router at '/api' to produce: /api/user/me
 */
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);    // Handles /api/user/me AND /api/transactions/my
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

/* --- 3. ERROR HANDLING --- */

// Catch-all for undefined routes (the 404 error you saw)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  // Use status code from error or default to 500
  const statusCode = err.statusCode || 500;
  console.error(`[SERVER_ERROR] ${statusCode}:`, err.stack);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;

