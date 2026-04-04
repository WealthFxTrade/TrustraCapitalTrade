import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

// ── ROUTES ──
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// ── MIDDLEWARE ──
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 10000;

// ── CORS CONFIGURATION ──
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'https://www.trustracapitaltrade.online',
  'http://localhost:5173',
  'http://172.20.10.3:5173', // Termux / local network IP
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Rejected: ${origin}`);
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// ── SOCKET.IO SETUP ──
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on('connection', (socket) => {
  console.log(`🔌 New Socket Connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 Socket Disconnected: ${socket.id}`));
});

// ── GLOBAL MIDDLEWARE ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── API ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// ── CATCH-ALL 404 ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on backend`,
  });
});

// ── ERROR HANDLER ──
app.use(errorHandler);

// ── DATABASE CONNECTION & SERVER START ──
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI missing in environment');
  process.exit(1);
}

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Allowed CORS Origins: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ── HANDLE UNCAUGHT EXCEPTIONS & UNHANDLED REJECTIONS ──
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});
