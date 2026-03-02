import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Route Protocols
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js'; 
import { startRoiEngine } from './workers/roiEngine.js';

dotenv.config();

// ── 0. SECURITY PRE-FLIGHT AUDIT ──
const REQUIRED_ENVS = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY', 'ENCRYPTION_IV', 'SMTP_PASS'];
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`🚨 [CONFIG ERROR]: ${key} is missing.`);
    process.exit(1); 
  }
});

const app = express();
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === 'production';

// ── 1. MIDDLEWARE ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// ── 2. CORS PROTOCOL ──
const allowedOrigins = ['https://trustra-capital-trade.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !isProduction || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS Rejection'));
  },
  credentials: true
}));

// ── 3. ROUTES ──

// ROOT ROUTE (Fixes "Cannot GET /" and passes Render Health Checks)
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="background:#020408; color:#eab308; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; border:1px solid #111;">
      <h1 style="font-style:italic; font-size:40px; margin:0;">TRUSTRA CAPITAL</h1>
      <p style="color:#fff; opacity:0.3; font-size:10px; letter-spacing:5px; margin-top:10px;">SECURE NODE_ALPHA_01</p>
      <div style="margin-top:30px; padding:8px 24px; border:1px solid #eab308; border-radius:50px; font-size:10px; font-weight:bold; text-transform:uppercase;">Status: Operational</div>
    </div>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', db: mongoose.connection.readyState === 1 ? 'online' : 'offline' });
});

// ── 4. INITIALIZATION ──
const startNode = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'trustra_main' });
    console.log('📡 Database Handshake Successful');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TERMINAL ONLINE: PORT ${PORT}`);
      startRoiEngine(null);
    });
  } catch (err) {
    console.error('❌ Initialization Failed:', err);
    process.exit(1);
  }
};

startNode();

// ── 5. ERROR HANDLING ──
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: isProduction ? 'Internal Protocol Error' : err.message
  });
});

