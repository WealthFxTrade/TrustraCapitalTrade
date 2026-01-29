// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

/* ===========================
   TRUST PROXY (RENDER FIX)
=========================== */
app.set('trust proxy', 1);

/* ===========================
   BASIC MIDDLEWARE
=========================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===========================
   CORS CONFIG
=========================== */
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

console.log('Frontend allowed:', allowedOrigins.join(', '));

/* ===========================
   RATE LIMITING
=========================== */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

/* ===========================
   ROUTES
=========================== */
app.get('/', (req, res) => {
  res.json({ status: 'Trustra Capital Trade API running 🚀' });
});

app.use('/api/auth', authRoutes);

/* ===========================
   DB CONNECTION
=========================== */
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

/* ===========================
   START SERVER
=========================== */
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

/* ===========================
   GRACEFUL SHUTDOWN (NO CALLBACKS)
=========================== */
const shutdown = async (signal) => {
  console.log(`${signal} received — shutting down gracefully`);

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (err) {
    console.error('❌ Error closing MongoDB:', err.message);
  }

  server.close(() => {
    console.log('🛑 HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
