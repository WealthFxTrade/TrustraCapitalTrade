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
import transactionRoutes from './routes/transaction.js';
import adminRoutes from './routes/admin.js'; // CRITICAL: Added for Admin Panel

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */

// Configured helmet to allow cross-origin requests in production
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// PRODUCTION CORS CONFIGURATION
app.use(cors({
  origin: [
    'https://trustra-capital-trade.vercel.app', // YOUR FRONTEND URL
    'http://localhost:5173',                   // LOCAL VITE
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

/* --- 2. API ROUTE MOUNTING --- */

// Health Check
app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active - Nodes Synchronized"
}));

// Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // Matches frontend calls to /api/user
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes); // CRITICAL: Mount Admin routes

/* --- 3. ERROR HANDLING --- */

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[TRUSTRA_SERVER_ERROR] ${statusCode}:`, err.message);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;

