import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import https from 'https';

// Config & Middleware
import validateEnv from './config/validateEnv.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import marketRoutes from './routes/market.js';
import investmentRoutes from './routes/investmentRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import transactionRoutes from './routes/transactions.js';
import bitcoinRoutes from './routes/bitcoin.js';
import planRoutes from './routes/plan.js';
import reviewRoutes from './routes/reviews.js';

// Services
import initCronJobs from './utils/cronJob.js';
import { startBtcDaemon } from './services/btcWatcher.js';

validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT, 10) || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── CORS SETUP ──
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.SOCKET_CORS_ORIGIN,
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173'
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
}

const app = express();

// ── SECURITY ──
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", "https:", "wss:", "ws:"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── MIDDLEWARE ──
app.use(cors({
  origin: (origin, cb) => isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS')),
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// ── API ENDPOINTS ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'online', env: process.env.NODE_ENV });
});

// ── FRONTEND SERVING (PRODUCTION) ──
if (IS_PROD) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ── ERROR HANDLING ──
app.use(notFound);
app.use(errorHandler);

// ── KEEP ALIVE (Self-Ping every 10 mins) ──
if (IS_PROD) {
  setInterval(() => {
    https.get("https://trustracapitaltrade-backend.onrender.com/health", (res) => {
      if (res.statusCode === 200) console.log('♻️ Keep-alive ping successful');
    }).on('error', (err) => console.error('❌ Keep-alive ping failed:', err.message));
  }, 600000);
}

// ── SERVER & SOCKETS ──
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    const io = new Server(server, {
      cors: {
        origin: (origin, cb) => isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('Socket CORS rejected')),
        credentials: true
      }
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Auth required'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    const notifyAdmins = (event, data) => {
      io.to('admin_room').emit('admin_notification', { event, data, timestamp: new Date() });
    };

    io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.userId}`);
      socket.join(socket.userId);
      if (socket.userRole === 'admin') {
        socket.join('admin_room');
        notifyAdmins('ADMIN_LOGGED_IN', { adminId: socket.userId });
      }
    });

    app.set('socketio', io);
    initCronJobs(io);
    startBtcDaemon(10);

  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

startServer();
