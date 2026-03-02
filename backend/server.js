import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

// ── 0. DYNAMIC CONFIG AUDIT ──
const REQUIRED_ENVS = ['MONGO_URI', 'JWT_SECRET']; 
const isProduction = process.env.NODE_ENV === 'production';

// Verify critical infrastructure before booting
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key] && isProduction) {
    console.error(`🚨 [FATAL]: ${key} is missing. System shutdown.`);
    process.exit(1);
  }
});

import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import { startRoiEngine } from './workers/roiEngine.js';

const app = express();
const PORT = process.env.PORT || 10000;

// ── 1. MIDDLEWARE ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

// ✅ FIX: Robust CORS Handshake
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://trustra-capital-trade.vercel.app' 
].filter(Boolean); // Removes 'undefined' if FRONTEND_URL isn't set

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy: Origin not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── 2. HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'syncing',
    timestamp: new Date().toISOString()
  });
});

// Root terminal view
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="background:#020408; color:#eab308; height:100vh; display:flex; align-items:center; justify-content:center; font-family:monospace;">
      <div style="text-align:center; border:1px solid #eab308; padding:40px; border-radius:20px; box-shadow: 0 0 20px rgba(234, 179, 8, 0.2);">
        <h1 style="font-style:italic; font-size:32px; margin:0; letter-spacing: -1px;">TRUSTRA CORE v8.4</h1>
        <p style="color:#fff; opacity:0.5; margin-top:10px; text-transform:uppercase; font-size:10px; letter-spacing:2px;">
          Gateway Status: ${mongoose.connection.readyState === 1 ? '● ONLINE' : '○ SYNCING...'}
        </p>
      </div>
    </div>
  `);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// ── 3. BOOT SEQUENCE ──
const startServer = async () => {
  try {
    // Connect to DB with a 5-second timeout to prevent hanging
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log('📡 Database Handshake Successful');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA CORE LIVE: PORT ${PORT}`);
      startRoiEngine(); 
    });
  } catch (err) {
    console.error('❌ Boot Error:', err.message);
    // Restart logic for Render
    setTimeout(startServer, 5000);
  }
};

startServer();
