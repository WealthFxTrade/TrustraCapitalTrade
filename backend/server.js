// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Cron job
import './cron/profitCron.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

/* ---------------- SECURITY & MIDDLEWARE ---------------- */
app.use(helmet());

// Rate limiting on auth routes (very important to prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // stricter for production
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS — only allow trusted origins
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Body parsers with size limit (prevents DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---------------- HEALTH & STATUS ENDPOINTS ---------------- */
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TrustraCapitalTrade Backend is running',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongoConnected: mongoose.connection.readyState === 1,
    uptime: process.uptime(),
  });
});

/* ---------------- ROUTES ---------------- */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);

/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: \( {req.method} \){req.originalUrl}`,
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error(`[ERROR] \( {req.method} \){req.originalUrl}:`, err.stack || err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

/* ---------------- MONGODB CONNECTION ---------------- */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('⚠️ MONGO_URI is not set in environment variables');
    process.exit(1); // Crash early in production
  }

  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      });
      console.log('✅ MongoDB connected successfully');
      break;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection failed (attempt \( {retries}/ \){maxRetries}):`, err.message);
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s backoff
    }
  }
};

connectDB();

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend allowed: ${allowedOrigins.join(', ')}`);
});

/* ---------------- GRACEFUL SHUTDOWN ---------------- */
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
