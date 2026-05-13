// backend/server.js
import './env.js';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorMiddleware.js';

// Background Services
import { watchBtcDeposits } from './utils/btcWatcher.js';
import { watchEthDeposits } from './utils/ethWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

/**
 * =========================
 * 1. SECURITY
 * =========================
 */
app.use(helmet({ contentSecurityPolicy: false }));

if (IS_PROD) {
  app.set('trust proxy', 1);
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
});
app.use('/api/', apiLimiter);

/**
 * =========================
 * 2. MIDDLEWARE
 * =========================
 */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/**
 * =========================
 * 3. CORS
 * =========================
 */
const allowedOrigins = [
  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (!IS_PROD) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ CORS BLOCKED: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

/**
 * =========================
 * 4. SOCKET.IO
 * =========================
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    socket.join(userId.toString());
  });
});

app.set('io', io);

/**
 * =========================
 * 5. ROUTES
 * =========================
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

/**
 * =========================
 * 6. HEALTH CHECK
 * =========================
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'active',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/**
 * =========================
 * 7. SPA SERVE
 * =========================
 */
if (IS_PROD) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

/**
 * =========================
 * 8. ERROR HANDLER
 * =========================
 */
app.use(errorHandler);

/**
 * =========================
 * 9. DATABASE CONNECTION (FIXED)
 * =========================
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log('✅ MongoDB Connected');

    mongoose.connection.on('disconnected', () => {
      console.log('❌ MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB Reconnected');
    });

  } catch (err) {
    console.error('❌ DB ERROR:', err.message);
    process.exit(1);
  }
};

/**
 * =========================
 * 10. BACKGROUND SERVICES (FIXED)
 * =========================
 */
let running = false;

const startServices = () => {
  if (running) return;
  running = true;

  console.log('⚙️ Starting Background Services...');

  initRioEngine(io);

  // SAFE INTERVAL (no overload)
  setInterval(async () => {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Skipping watchers (DB not ready)');
      return;
    }

    await watchBtcDeposits(io);
    await watchEthDeposits(io);

  }, 5 * 60 * 1000); // every 5 mins
};

/**
 * =========================
 * 11. START SERVER
 * =========================
 */
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
    startServices();
  });
});

/**
 * =========================
 * 12. GLOBAL ERROR SAFETY
 * =========================
 */
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
});
