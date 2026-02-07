import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Route imports - Extensions (.js) are REQUIRED for Node v25.6.0 ESM
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/plan.js';
import marketRoutes from './routes/market.js';
import transactionRoutes from './routes/transaction.js';
import adminRoutes from './routes/admin.js';
import walletRoutes from './routes/wallet.js'; // Added to handle address generation
import withdrawalRoutes from './routes/withdrawalRoutes.js'; // Added to handle payout requests

const app = express();

/* --- 1. GLOBAL MIDDLEWARE --- */

// Security: Configured for 2026 browsers to allow QR code rendering and cross-origin assets
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// PRODUCTION CORS CONFIGURATION
// Ensure these match your Vercel/Live frontend exactly to prevent "Dead Buttons"
app.use(cors({
  origin: [
    'https://trustra-capital-trade.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

/* --- 2. API ROUTE MOUNTING --- */

// Health Check - Verification for Render.com zero-downtime deploys
app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active - Nodes Synchronized",
  timestamp: new Date().toISOString()
}));

// Core Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

// Wallet & Financial Routes (Fixed: These were missing, causing the generation errors)
app.use('/api/wallet', walletRoutes);           // Endpoint: POST /api/wallet/:asset
app.use('/api/withdrawals', withdrawalRoutes);   // Endpoint: POST /api/withdrawals/request
app.use('/api/transactions', transactionRoutes);

// Management Routes
app.use('/api/admin', adminRoutes);

/* --- 3. ERROR HANDLING --- */

// 404 Handler - Catches unmounted routes to prevent frontend hang
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler - Prevents server crash and provides clean API responses
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log full error on server for debugging, send clean message to client
  console.error(`[TRUSTRA_SERVER_ERROR] ${statusCode}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in local development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;

