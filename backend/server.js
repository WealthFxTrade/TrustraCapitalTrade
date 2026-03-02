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

// ── 0. PRE-FLIGHT SECURITY AUDIT ──
// Ensures Gery's AES-256 Handshake won't fail due to missing keys
const REQUIRED_ENVS = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY', 'ENCRYPTION_IV', 'SMTP_PASS'];
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`🚨 [CRITICAL CONFIG MISSING]: ${key} is NOT defined in .env`);
    process.exit(1); 
  }
});

const app = express();
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === 'production';

// ── 1. SECURITY & OPTIMIZATION ──
app.use(helmet({
  contentSecurityPolicy: false, // Required for Trustra visual assets
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// ── 2. DYNAMIC CORS (Handshake Protocol) ──
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'https://trustracapitaltrade-backend.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !isProduction) return callback(null, true);
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o));
    if (isAllowed) return callback(null, true);
    return callback(new Error('Unauthorized Access Protocol'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── 3. ROUTES (Root + API Prefixes) ──

/**
 * @desc Render Root Route (Essential for Health Checks & Branding)
 */
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="background:#020408; color:#eab308; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; border: 1px solid #111;">
      <h1 style="font-style:italic; letter-spacing:-2px; font-size:40px; margin:0;">TRUSTRA CAPITAL</h1>
      <p style="color:#fff; opacity:0.3; font-size:10px; letter-spacing:5px; margin-top:10px; font-weight:900;">SECURE TERMINAL NODE_ALPHA_01</p>
      <div style="margin-top:30px; padding:8px 24px; border:1px solid #eab308; border-radius:50px; font-size:10px; font-weight:bold; color:#eab308; text-transform:uppercase;">Status: Operational</div>
    </div>
  `);
});

// API Routes synchronized with Vite Proxy
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// Detailed Health Monitor
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'active', 
    node: 'Trustra-Alpha-01',
    db: mongoose.connection.readyState === 1 ? 'online' : 'offline',
    uptime: Math.floor(process.uptime())
  });
});

// ── 4. DATABASE & ENGINE INITIALIZATION ──
const connectGateway = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'trustra_main'
    });
    console.log('📡 [SYSTEM] Database Handshake Successful');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA SECURE TERMINAL ONLINE: PORT ${PORT}`);
      
      try {
        // Initialize ROI Engine (Socket.io null-check handled inside worker)
        startRoiEngine(null); 
        console.log('⚙️ [ENGINE] ROI Distribution Logic Initialized');
      } catch (engineErr) {
        console.error('⚠️ [ENGINE] ROI Worker Failed:', engineErr);
      }
    });
  } catch (err) {
    console.error('❌ [CRITICAL] Gateway Initialization Failed:', err);
    // Emergency listen for health checks
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ TERMINAL STARTING IN LIMITED MODE (DB OFFLINE)`);
    });
  }
};

connectGateway();

// ── 5. GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('🚨 [GLOBAL ERROR]:', err.stack || err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: isProduction ? 'Internal Protocol Error' : err.message,
    protocol: 'Trustra-Alpha-Secure',
    code: status
  });
});

// Anti-Crash Protocols
process.on('unhandledRejection', (reason) => {
  console.error('🚨 UNHANDLED REJECTION:', reason);
});

