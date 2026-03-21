import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Engine & Utility Imports
import { watchBtcDeposits } from './utils/btcWatcher.js';
import { initRioEngine } from './utils/rioEngine.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// 🌐 1. CORE MIDDLEWARE & CORS (Updated for Termux Network)
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.20.10.2:5173' // Your current Network IP
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked: Origin ${origin} unauthorized`);
      callback(new Error('CORS blocked: Origin not authorized'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔌 2. SOCKET.IO CONFIGURATION
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => socket.join(userId));
});

// 📂 3. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', mode: process.env.NODE_ENV });
});

// ⚙️ 4. TRUSTRA ENGINES
const startEngines = () => {
  setInterval(() => watchBtcDeposits(io), 5 * 60 * 1000);
  initRioEngine(io);
  console.log('✅ Engines Active: RIO Engine + BTC Watcher');
};

// 🛠️ 5. INITIALIZATION
const PORT = process.env.PORT || 10000;
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log('------------------------------------------------------------');
      console.log(`🚀 TRUSTRA LIVE | PORT: ${PORT} | MODE: ${process.env.NODE_ENV}`);
      console.log('------------------------------------------------------------');
      startEngines();
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();

