// backend/server.js
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Internal imports
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initRioEngine } from './utils/rioEngine.js';

// Polyfill __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ── DATABASE CONNECTION ──
connectDB();

// ── MIDDLEWARE ──
app.use(helmet({
  contentSecurityPolicy: false, // Required for serving frontend/backend together
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://trustra-capital-trade.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── SOCKET.IO SETUP ──
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  if (userId) {
    socket.join(userId.toString());
    console.log(`📡 Node Synced: ${userId}`);
  }
  socket.on('disconnect', () => console.log(`🔌 Node Offline`));
});

// ── ROUTES (Note the /api prefix) ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// ── RIO ENGINE ──
initRioEngine(io);

// ── PRODUCTION: SERVE FRONTEND DIST ──
if (process.env.NODE_ENV === 'production') {
  // Use absolute path for Termux environments
  const frontendPath = path.resolve(__dirname, '../frontend/dist');
  console.log(`📦 Serving Static Assets: ${frontendPath}`);

  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    // If it's a failed API call, don't serve HTML
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API Protocol Endpoint Not Found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'Online', mode: 'Development' });
  });
}

// ── ERROR HANDLING ──
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TRUSTRA CORE LIVE | PORT: ${PORT}`);
});
