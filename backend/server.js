// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import transactionRoutes from './routes/transaction.js';

// Load env
dotenv.config();

const app = express();

// Trust proxy (Render / Vercel / Cloudflare)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Request logging (dev friendly)
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS - strict allowlist
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
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health checks
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TrustraCapitalTrade API is running' });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot \( {req.method} \){req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// MongoDB connection with retry
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  let retries = 0;
  const maxRetries = 5;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('MongoDB connected');
      break;
    } catch (err) {
      retries++;
      console.error(`MongoDB connect failed (attempt \( {retries}/ \){maxRetries})`, err.message);
      if (retries === maxRetries) process.exit(1);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received - shutting down`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
