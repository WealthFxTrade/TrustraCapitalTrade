// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import your routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';
// import adminUsersRoutes from './routes/adminUsers.js';
// import adminKycRoutes from './routes/adminKyc.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ──────────────────────────────────────────────
// Security & Middleware
// ──────────────────────────────────────────────
app.set('trust proxy', 1); // Required for Render/Vercel IP handling

app.use(helmet()); // Security headers

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150,                 // limit each IP to 150 requests per window
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// CORS - strict allowlist
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (more verbose in dev)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
// app.use('/api/admin/users', adminUsersRoutes);
// app.use('/api/admin/kyc', adminKycRoutes);

// Health check endpoint (Render/Vercel uses this)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TrustraCapitalTrade Backend API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot \( {req.method} \){req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ──────────────────────────────────────────────
// MongoDB Connection with Retry
// ──────────────────────────────────────────────
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      });
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection failed (attempt \( {retries}/ \){maxRetries}):`, err.message);
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Start server after successful DB connection
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });

  // Graceful shutdown (important on Render)
  const shutdown = (signal) => {
    console.log(`${signal} received — shutting down gracefully`);
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
