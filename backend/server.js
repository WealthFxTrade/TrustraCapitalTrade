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
import apiRoutes from './routes/apiRoutes.js';

// ── MIDDLEWARE ──
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── ALLOWED ORIGINS ──
const allowedOrigins = [
  'https://www.trustracapitaltrade.online',
  'https://trustracapitaltrade.online',
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.20.10.2:5173',
  'http://172.20.10.3:5173'
];

// ── CORS MIDDLEWARE ──
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
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
}));

// ── GLOBAL MIDDLEWARE ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy is required for Render/Vercel to handle cookies correctly
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
    methods: ["GET", "POST"]
  },
  // Add transports to avoid polling issues on some hostings
  transports: ['websocket', 'polling'] 
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 Socket Disconnected: ${socket.id}`));
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
    message: 'Server is healthy',
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// ── CATCH-ALL 404 ROUTE ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on backend`
  });
});

// ── ERROR HANDLER ──
app.use(errorHandler);

// ── DATABASE CONNECTION ──
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
      console.log(`Environment: ${NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ── GLOBAL ERROR HANDLING ──
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});
