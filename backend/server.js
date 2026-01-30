// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import process from 'process';

// BTC address utils
import { generateBtcAddress, generateBtcAddresses } from './utils/addresses.js';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const BITCOIN_XPUB = process.env.BITCOIN_XPUB;

// ──────────────────────────────
// Critical environment variable checks
if (!MONGO_URI) {
  console.error('CRITICAL: MONGO_URI not set');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET not set');
  process.exit(1);
}
if (!BITCOIN_XPUB) {
  console.error('CRITICAL: BITCOIN_XPUB not set');
  process.exit(1);
}

// ──────────────────────────────
// Middleware
app.use(helmet());
app.set('trust proxy', 1);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  })
);

app.use(
  cors({
    origin: [
      'https://trustra-capital-trade.vercel.app',
      'http://localhost:5173',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ──────────────────────────────
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// BTC address endpoints
app.get('/api/btc/address', (req, res) => {
  const index = parseInt(req.query.index) || 0;
  const type = req.query.type || 'nativeSegwit';
  try {
    const address = generateBtcAddress(index, type);
    res.json({ index, type, address });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/btc/addresses', (req, res) => {
  const startIndex = parseInt(req.query.start) || 0;
  const count = parseInt(req.query.count) || 5;
  const type = req.query.type || 'nativeSegwit';
  try {
    const addresses = generateBtcAddresses(count, startIndex, type);
    res.json(addresses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ──────────────────────────────
// MongoDB connection with retry
const connectDB = async () => {
  let retries = 0;
  while (retries < 5) {
    try {
      await mongoose.connect(MONGO_URI, {
        dbName: 'TrustraCapitalTrade',
      });
      console.log('MongoDB connected');
      console.log('Connected database name:', mongoose.connection.name);
      break;
    } catch (err) {
      retries++;
      console.error(`MongoDB connect failed (attempt ${retries}/5):`, err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  if (retries === 5) {
    console.error('MongoDB connection failed after 5 attempts');
    process.exit(1);
  }
};

// ──────────────────────────────
// Graceful shutdown (Mongoose v8+)
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Closing server gracefully...`);
  try {
    await mongoose.connection.close(); // no callback
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
  process.exit(0);
};

['SIGINT', 'SIGTERM'].forEach((sig) =>
  process.on(sig, () => shutdown(sig))
);

// ──────────────────────────────
// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
