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
 * 1. SECURITY
 */
app.use(helmet({ contentSecurityPolicy: false }));

if (IS_PROD) {
  app.set('trust proxy', 1);
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Security Alert: Excessive requests from this IP.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

/**
 * 2. PERFORMANCE & MIDDLEWARE
 */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/**
 * 3. CORS (FIXED & SECURE)
 */
const allowedOrigins = [
  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman/mobile

      if (!IS_PROD) return callback(null, true); // allow all in dev

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ Blocked by CORS: ${origin}`);
      return callback(new Error('CORS policy violation'));
    },
    credentials: true,
  })
);

/**
 * 4. SOCKET.IO (SYNCED WITH CORS)
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  socket.on('join', (userId) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return;

      const room = userId.toString();

      // Prevent duplicate join
      if (socket.rooms.has(room)) return;

      socket.join(room);
      connectedUsers.set(socket.id, room);

      console.log(`🔒 User ${userId} joined private room`);
    } catch (err) {
      console.error('Join Error:', err);
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
  });
});

app.set('io', io);

/**
 * 5. ROUTES
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'active',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

/**
 * 6. SPA SERVE (PRODUCTION)
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
 * 7. ERROR HANDLER
 */
app.use(errorHandler);

/**
 * 8. BACKGROUND SERVICES (FIXED DUPLICATION)
 */
let servicesInitialized = false;
let intervalRef;

const startServices = () => {
  if (servicesInitialized) {
    console.log('⚠️ Services already initialized, skipping...');
    return;
  }

  servicesInitialized = true;

  console.log('⚙️ Starting Engines...');

  // Start RIO Engine (should internally guard itself too)
  initRioEngine(io);

  // Run watchers once
  watchBtcDeposits(io);
  watchEthDeposits(io);

  // Then run periodically (5 mins)
  intervalRef = setInterval(() => {
    watchBtcDeposits(io);
    watchEthDeposits(io);
  }, 5 * 60 * 1000);
};

/**
 * 9. START SERVER
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
      startServices();
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  });

/**
 * 10. GRACEFUL SHUTDOWN
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down...`);

  if (intervalRef) clearInterval(intervalRef);

  try {
    await mongoose.connection.close();
    console.log('🧹 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

/**
 * 11. GLOBAL ERROR SAFETY (VERY IMPORTANT)
 */
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
});
