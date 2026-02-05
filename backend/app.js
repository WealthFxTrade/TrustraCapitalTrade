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
app.use(helmet()); // Security headers
app.use(compression()); // Gzip for faster Termux loading
app.use(express.json());
app.use(morgan('dev')); // Logging for debugging

// CORS: Hardened for Vercel Production & Local Development
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://trustra-capital-trade.vercel.app', 
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    // Allow requests with no origin (like mobile apps or curl) 
    // or origins ending with .vercel.app for preview deployments
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Trustra Security (CORS)'));
    }
  },
  credentials: true
}));

/* --- 2. API ROUTE MOUNTING --- */

// Health Check (Used by Render.com to verify deployment)
app.get('/', (req, res) => res.json({ 
  success: true, 
  message: "Trustra 2026 API Active",
  timestamp: new Date().toISOString()
}));

/**
 * MOUNTING STRATEGY:
 * We mount userRoutes at '/api' so that inside user.js:
 * router.get('/user/me') becomes /api/user/me
 * router.get('/transactions') becomes /api/transactions
 */
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); 
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

