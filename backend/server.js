import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

// ── 0. DYNAMIC CONFIG AUDIT ──
const REQUIRED_ENVS = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY', 'ENCRYPTION_IV'];
const isProduction = process.env.NODE_ENV === 'production';

REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    if (isProduction) {
      console.error(`🚨 [FATAL]: ${key} is missing. System shutdown.`);
      process.exit(1); 
    } else {
      console.warn(`⚠️ [DEV WARNING]: ${key} missing. Using temporary key.`);
      process.env[key] = key === 'ENCRYPTION_KEY' 
        ? 'default_32_char_key_for_dev_only_!!' 
        : 'default_16_char_iv';
    }
  }
});

// Import routes AFTER env check
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
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));

// ── 2. LANDING PAGE (Instant Load) ──
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="background:#020408; color:#eab308; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif;">
      <div style="text-align:center; border:1px solid #eab308; padding:40px; border-radius:10px;">
        <h1 style="font-style:italic; font-size:40px; margin:0;">TRUSTRA CAPITAL</h1>
        <p style="color:#fff; opacity:0.5; margin-top:10px;">NODE STATUS: ${mongoose.connection.readyState === 1 ? 'ONLINE' : 'SYNCING...'}</p>
      </div>
    </div>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// ── 3. NON-BLOCKING BOOT ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVER LIVE: http://localhost:${PORT}`);
  
  // Connect to DB in background
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('📡 Database Handshake Successful');
      startRoiEngine(null); 
    })
    .catch(err => console.error('❌ DB Connection Error:', err.message));
});

