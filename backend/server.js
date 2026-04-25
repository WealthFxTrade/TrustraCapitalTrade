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
 * 3. CORS
 */
const allowedOrigins = [
  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || !IS_PROD) {
      return callback(null, true);
    }
    callback(new Error('Cross-Origin Request Blocked by Trustra Firewall'));
  },
  credentials: true,
}));

/**
 * 4. SOCKET.IO
 */
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  socket.on('join', (userId) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.warn(`⚠️ Invalid join attempt`);
        return;
      }

      const room = userId.toString();
      if (connectedUsers.get(socket.id) === room) return;

      socket.join(room);
      connectedUsers.set(socket.id, room);
      console.log(`🔒 User ${userId} joined private room`);
    } catch (err) {
      console.error('Join Error:', err);
    }
  });

  socket.on('disconnect', (reason) => {
    connectedUsers.delete(socket.id);
    console.log(`🔌 Disconnected: \( {socket.id} ( \){reason})`);
  });

  socket.on('error', (err) => {
    console.error(`Socket Error:`, err.message);
  });
});

app.set('io', io);

/**
 * 5. ROUTES
 */
app.use('/auth', authRoutes);
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
 * 6. SPA (Production)
 */
if (IS_PROD) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/auth')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(errorHandler);

/**
 * 7. SERVICES
 */
let servicesInitialized = false;
let intervalRef;

const startServices = () => {
  if (servicesInitialized) return;
  servicesInitialized = true;

  console.log('⚙️ Starting Engines...');

  initRioEngine(io);
  watchBtcDeposits(io);
  watchEthDeposits(io);

  intervalRef = setInterval(() => {
    watchBtcDeposits(io);
    watchEthDeposits(io);
  }, 5 * 60 * 1000);
};

/**
 * 8. START SERVER
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
      startServices();
    });
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  });

/**
 * 9. GRACEFUL SHUTDOWN (FIXED for Mongoose 7+ / Node 24)
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  if (intervalRef) {
    clearInterval(intervalRef);
    console.log('⏹️ Background interval cleared');
  }

  try {
    await new Promise((resolve) => io.close(resolve)); // Close Socket.IO
    console.log('✅ Socket.IO closed');
  } catch (err) {
    console.error('Error closing Socket.IO:', err.message);
  }

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (err) {
    console.error('❌ Error closing MongoDB:', err.message);
  }

  console.log('👋 Server shutdown complete');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
