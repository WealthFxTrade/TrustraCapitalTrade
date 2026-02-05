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
// Import your custom handler
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */
app.use(helmet()); 
app.use(compression()); 
app.use(express.json({ limit: '10kb' })); // Production security: limit body size
app.use(morgan('dev')); 

// CORS Configuration
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

app.use('/api/auth', authRoutes);
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

// Use your custom errorHandler instead of the generic one
app.use(errorHandler);

export default app;

