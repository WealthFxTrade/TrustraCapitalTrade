import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
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

const PORT = parseInt(process.env.PORT, 10) || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── CORS SETUP ──
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

const app = express();

// ── SECURITY & MIDDLEWARE ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// ── API ROUTES ──
app.get('/health', (_req, res) => res.json({ status: 'online', timestamp: new Date() }));

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

// ── ERROR HANDLING ──
app.use(notFound);
app.use(errorHandler);

// ── KEEP ALIVE (Self-Ping for Render Free Tier) ──
if (IS_PROD) {
  setInterval(() => {
    https.get("https://trustracapitaltrade-backend.onrender.com", (res) => {
      if (res.statusCode === 200) console.log('♻️ Keep-alive successful');
    }).on('error', (err) => console.error('❌ Keep-alive failed:', err.message));
  }, 600000); // 10 minutes
}

// ── SERVER & SOCKETS ──
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ API Server running on port ${PORT}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: corsOptions
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

    io.on('connection', (socket) => {
      socket.join(socket.userId);
      if (socket.userRole === 'admin') socket.join('admin_room');
      console.log(`🔌 Socket connected: ${socket.userId}`);
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

