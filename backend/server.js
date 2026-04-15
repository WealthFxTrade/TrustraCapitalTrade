// server.js
import './env.js'; // MUST BE LINE 1 - loads environment variables

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

// ── MODELS ──
import User from './models/User.js';

// ── ROUTES ──
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

// ── MIDDLEWARE ──
import { errorHandler } from './middleware/errorMiddleware.js';

// ── WATCHERS & ENGINES ──
import { watchBtcDeposits } from './utils/btcWatcher.js';
import { watchEthDeposits } from './utils/ethWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🚀 Starting Trustra Capital Backend in ${NODE_ENV} mode...`);

// ── ALLOWED ORIGINS ──
const allowedOrigins = [
  'https://www.trustracapitaltrade.online',
  'https://trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.20.10.2:5173',
  'http://172.20.10.3:5173',
  'http://localhost:10000'
];

// ── CORS CONFIGURATION ──
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ CORS Rejected: ${origin}`);
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// ── GLOBAL MIDDLEWARE ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
} else {
  app.use(morgan('dev'));
}

// ── SOCKET.IO SETUP ──
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  // Join private room for real-time balance updates
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`👥 User joined private room: ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket Disconnected: ${socket.id}`);
  });
});

// ── API ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trustra Capital Backend is healthy',
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ── 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ── GLOBAL ERROR HANDLER ──
app.use(errorHandler);

// ── BACKGROUND SERVICES INITIALIZATION ──
let servicesInitialized = false;

const startServices = (io) => {
  if (servicesInitialized) return;
  servicesInitialized = true;

  console.log('⚙️ [SYSTEM] Initializing Background Services...');

  // 1. Rio Yield Engine
  initRioEngine(io);

  // 2. Blockchain Watchers
  console.log('📡 [BLOCKCHAIN] Starting Watcher Services...');
  
  // Initial run
  watchBtcDeposits(io);
  watchEthDeposits(io);

  // Scheduled runs every 5 minutes
  setInterval(() => {
    console.log('🔄 Watcher Sync: Checking for new deposits...');
    watchBtcDeposits(io);
    watchEthDeposits(io);
  }, 5 * 60 * 1000);
};

// ── DATABASE CONNECTION ──
mongoose.set('strictQuery', true);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      
      // Start background services
      startServices(io);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── GLOBAL CRASH HANDLERS ──
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.stack || err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
