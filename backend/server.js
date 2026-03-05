import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

// ── MIDDLEWARE & ERROR PROTOCOL IMPORTS ──
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// Matching the import name from our profitEngine.js
import { initializeProfitDistributor } from './utils/profitEngine.js'; 

// ── ROUTE IMPORTS ──
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

// ── 0. CONFIG & INFRASTRUCTURE ──
const PORT = process.env.PORT || 10000;
const app = express();
const server = http.createServer(app);

// ✅ Robust CORS Handshake
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://trustra-capital-trade.vercel.app'
].filter(Boolean);

// ── 1. SOCKET.IO REAL-TIME ENGINE ──
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make 'io' accessible in our routes via req.app.get('socketio')
app.set('socketio', io);

io.on('connection', (socket) => {
  socket.on('join_terminal', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`📡 Terminal Sync: Node ${userId} connected`);
    }
  });

  socket.on('disconnect', () => {
    console.log('📡 Terminal Link severed');
  });
});

// ── 2. GLOBAL MIDDLEWARE ──
app.use(helmet({ contentSecurityPolicy: false }));

/** * CRITICAL: These must come BEFORE routes to prevent 
 * the "Username Required" Internal Server Error 
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy: Origin not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// ── 3. SYSTEM & HEALTH ROUTES ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'syncing',
    timestamp: new Date().toISOString()
  });
});

// ── 4. API BUSINESS LOGIC ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/support', supportRoutes);

// ── 5. ERROR PROTOCOLS ──
app.use(notFound);
app.use(errorHandler);

// ── 6. BOOT SEQUENCE ──
const startServer = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Database Handshake Successful');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA CORE LIVE: PORT ${PORT}`);
      
      // Start the Automated Profit Engine
      initializeProfitDistributor();
    });
  } catch (err) {
    console.error('❌ Boot Error:', err.message);
    // Exponential backoff for database connection retries
    setTimeout(startServer, 5000);
  }
};

startServer();
