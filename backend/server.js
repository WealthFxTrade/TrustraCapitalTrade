// backend/server.js
import './env.js'; // MUST BE FIRST - loads environment variables

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

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

// ES Module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

console.log(`🚀 Starting Trustra Capital Trade Backend in ${NODE_ENV} mode...`);

if (IS_PROD) {
  app.set('trust proxy', 1);
}

// CORS Configuration
const allowedOrigins = [
  'https://trustracapitaltrade.online',
  'https://www.trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.20.10.2:5173',
  'http://172.20.10.3:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`❌ CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Global Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (IS_PROD) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`👤 User ${userId} joined private room`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io); // Make io available in routes if needed

// Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trustra Capital Backend is healthy ✅',
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Production: Serve Frontend SPA
if (IS_PROD) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/auth')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Background Services
let servicesInitialized = false;

const startServices = () => {
  if (servicesInitialized) return;
  servicesInitialized = true;

  console.log('⚙️ Initializing background services...');
  initRioEngine(io);

  console.log('📡 Starting blockchain deposit watchers...');
  watchBtcDeposits(io);
  watchEthDeposits(io);

  setInterval(() => {
    console.log('🔄 Running deposit watchers...');
    watchBtcDeposits(io);
    watchEthDeposits(io);
  }, 5 * 60 * 1000);
};

// Database Connection + Server Start
mongoose.set('strictQuery', true);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startServices();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Global Crash Handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.stack || err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
