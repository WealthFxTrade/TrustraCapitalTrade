import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Internal Imports
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initRioEngine } from './utils/rioEngine.js';

dotenv.config();

// Initialize Database Connection
connectDB();

const app = express();
const httpServer = createServer(app);
const __dirname = path.resolve();

// ── MULTI-ORIGIN CORS LOGIC ──
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'https://trustra-capital-trade.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('CORS Policy Violation'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── SOCKET.IO REAL-TIME ENGINE ──
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`📡 Terminal Sync: Node ${userId} connected`);
  }
  socket.on('disconnect', () => {
    console.log('🔌 Node Disconnected');
  });
});

// ── API ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// ── PROFIT ENGINE (HEARTBEAT) ──
initRioEngine(io);

// ── STATIC ASSET MANAGEMENT (RENDER COMPATIBLE) ──
if (process.env.NODE_ENV === 'production') {
  // Move UP from the /backend folder to find /frontend/dist
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  // Serve static files
  app.use(express.static(frontendPath));

  // Handle SPA routing: Send index.html for all non-API requests
  app.get('*', (req, res) => {
    // Safety check to ensure we don't serve HTML for failed API calls
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('Trustra API Online... Node: Zurich-Mainnet-01'));
}

// ── ERROR HANDLING ──
app.use(notFound);
app.use(errorHandler);

// ── SERVER ACTIVATION ──
const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TRUSTRA CORE LIVE: PORT ${PORT}`);
  console.log(`🌍 MODE: ${process.env.NODE_ENV}`);
});
