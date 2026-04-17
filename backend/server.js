// backend/server.js
import './env.js'; // MUST BE FIRST

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
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// Socket.IO Setup
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`👤 User ${userId} connected`);
    }
  });
});

app.set('io', io);

// Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Enhanced Health Check for Production
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌';
  res.status(200).json({
    status: 'active',
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// Production SPA Serving
if (IS_PROD) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/auth')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(errorHandler);

// Background Services Manager
let servicesInitialized = false;
const startServices = () => {
  if (servicesInitialized) return;
  servicesInitialized = true;

  console.log('⚙️ Background Services: Starting...');
  
  // Initialize ROI Distribution Engine
  initRioEngine(io);

  // Initial Blockchain Scan
  watchBtcDeposits(io);
  watchEthDeposits(io);

  // Recursive Scans every 5 minutes
  setInterval(() => {
    console.log('🔄 Periodic Blockchain Sync...');
    watchBtcDeposits(io);
    watchEthDeposits(io);
  }, 5 * 60 * 1000);
};

// Database & Server Launch
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Ready');
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      startServices();
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Process Guards
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.stack);
  process.exit(1); 
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

