import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

// Middleware & Error Protocol Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { startRoiEngine } from './workers/roiEngine.js';

// Route Imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';

// ── 0. CONFIG & INFRASTRUCTURE ──
const isProduction = process.env.NODE_ENV === 'production';
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
app.use(express.json());
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

app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="background:#020408; color:#eab308; height:100vh; display:flex; align-items:center; justify-content:center; font-family:monospace; text-align:center;">
      <div style="border:1px solid #eab308; padding:40px; border-radius:20px; box-shadow: 0 0 20px rgba(234, 179, 8, 0.2);">
        <h1 style="font-style:italic; font-size:32px; margin:0;">TRUSTRA CORE v8.5</h1>
        <p style="color:#fff; opacity:0.5; margin-top:10px; text-transform:uppercase; font-size:10px; letter-spacing:2px;">
          Socket Status: ● ACTIVE | DB: ${mongoose.connection.readyState === 1 ? '● ONLINE' : '○ SYNCING...'}
        </p>
      </div>
    </div>
  `);
});

// ── 4. API BUSINESS LOGIC ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// ── 5. ERROR PROTOCOLS (The Mismatch Fix) ──
app.use(notFound);      
app.use(errorHandler);  

// ── 6. BOOT SEQUENCE ──
const startServer = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('📡 Database Handshake Successful');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA CORE LIVE: PORT ${PORT}`);
      
      // Start Background Workers with Socket access
      startRoiEngine(io);
    });
  } catch (err) {
    console.error('❌ Boot Error:', err.message);
    setTimeout(startServer, 5000); // Retry logic
  }
};

startServer();
