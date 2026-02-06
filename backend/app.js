import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports
import userRoutes from './routes/user.js'; 
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

// CORS Configuration: Hardened for Production & Vercel
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://trustra-capital-trade.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    // Regex allows all vercel.app subdomains and localhost for testing
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Trustra Security (CORS)'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* --- 2. API ROUTE MOUNTING --- */

/**
 * Health Check
 * Used by Render.com to verify deployment.
 */
app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active",
  timestamp: new Date().toISOString()
}));

/**
 * 🚀 DUAL MOUNTING STRATEGY:
 * This satisfies both frontend path patterns.
 */

// 1. Handles /api/user/login, /api/user/register, /api/user/balance
app.use('/api/user', userRoutes); 

// 2. Handles /api/transactions/my (since userRoutes has router.get('/transactions/my'))
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

// Custom Global Error Handler (Must be the last middleware)
app.use(errorHandler);

export default app;

