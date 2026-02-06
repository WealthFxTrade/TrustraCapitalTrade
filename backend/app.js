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
app.use(helmet());                        // Protects against common web vulnerabilities
app.use(compression());                   // Makes API responses smaller and faster
app.use(express.json({ limit: '10kb' })); // Security: limits JSON payload size
app.use(morgan('dev'));                   // Logs requests to Vercel/Render console for debugging

// CORS Configuration: Hardened for Vercel + local dev
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://trustra-capital-trade.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    // Allow Vercel preview deployments and local dev
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Trustra Security (CORS)'));
    }
  },
  credentials: true
}));

/* --- 2. API ROUTE MOUNTING --- */

// Health Check (Used by hosting platforms to monitor your app)
app.get('/', (req, res) => res.json({
  success: true,
  message: "Trustra 2026 API Active"
}));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// → Single, clean mounting of user routes (no duplication)
app.use('/api/user', userRoutes);

// Additional Routes
app.use('/api/plans', planRoutes);
app.use('/api/market', marketRoutes);

/* --- 3. ERROR HANDLING --- */

// 404 Handler for non-existent routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: \( {req.method} \){req.originalUrl}`
  });
});

// Custom Global Error Handler (Must be the last middleware)
app.use(errorHandler);

export default app;
