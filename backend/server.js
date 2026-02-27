// server.js - Production Optimized v8.4.1
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
  'https://trustracapitaltrade.vercel.app', // Added common Vercel variant
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error('CORS Policy: Origin not authorized by Trustra Node'));
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

// ── ROOT & SYSTEM HEALTH ──
// FIX: Added root route to satisfy Render's Go-http-client health checks
app.get('/', (_req, res) => {
  res.status(200).send('Trustra Capital Trade API v8.4.1 | Node Online');
});

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'online', 
    version: '8.4.1',
    timestamp: new Date().toISOString() 
  });
});

// ── API ROUTES ──
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

// ── KEEP ALIVE (Self-Ping for Render) ──
if (IS_PROD) {
  setInterval(() => {
    // FIX: Changed to /health to ensure a 200 response instead of 404
    https.get("https://trustracapitaltrade-backend.onrender.com", (res) => {
      if (res.statusCode === 200) console.log('♻️ Trustra Node: Keep-alive successful');
    }).on('error', (err) => console.error('❌ Keep-alive failed:', err.message));
  }, 600000); // 10 minutes
}

// ── SERVER & SOCKETS ──
async function startServer() {
  try {
    // Audit Check: Ensure MONGO_URI is set
    if (!process.env.MONGO_URI) throw new Error('Database configuration missing');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Trustra API Running: Port ${PORT}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: corsOptions
    });

    // Socket Auth Middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required for socket connection'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch {
        next(new Error('Invalid encryption token'));
      }
    });

    io.on('connection', (socket) => {
      socket.join(socket.userId);
      if (socket.userRole === 'admin') socket.join('admin_room');
      console.log(`🔌 Secured Node Connected: ${socket.userId}`);
    });

    app.set('socketio', io);
    initCronJobs(io);
    startBtcDaemon(10); // Sync cycles

  } catch (err) {
    console.error('❌ Startup Critical Error:', err.message);
    process.exit(1);
  }
}

startServer();

