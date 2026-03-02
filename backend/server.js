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
import withdrawalRoutes from './routes/withdrawalRoutes.js'; // Ensure this exists
import { startRoiEngine } from './workers/roiEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === 'production';

// ================================================
// 1. SECURITY & OPTIMIZATION (2026 Standards)
// ================================================
app.use(helmet({
  contentSecurityPolicy: false, // Required for Trustra Terminal visual assets
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// ================================================
// 2. DYNAMIC CORS (Fixed for Vite Proxy Handshake)
// ================================================
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'https://trustracapitaltrade-backend.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow Tooling/Mobile/Server-to-Server
    if (!origin) return callback(null, true);

    // 2. Dev Mode: Allow all Localhost & Local IPs (Termux/Hotspot)
    if (!isProduction) return callback(null, true);

    // 3. Prod Mode: Strict Domain Check
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o));
    if (isAllowed) return callback(null, true);

    return callback(new Error('Unauthorized Access Protocol'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ================================================
// 3. ROUTES (Prefixes Aligned with Vite /api Proxy)
// ================================================
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// Health Check for Render/Monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'active', 
    node: 'Trustra-Alpha-01',
    db: mongoose.connection.readyState === 1 ? 'online' : 'offline'
  });
});

// ================================================
// 4. DATABASE & ENGINE INITIALIZATION
// ================================================
const connectGateway = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'trustra_main'
    });
    console.log('📡 [SYSTEM] Database Handshake Successful');

    // Start Express Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA SECURE TERMINAL ONLINE: PORT ${PORT}`);
      
      // Initialize ROI Distribution Engine
      try {
        startRoiEngine(null); // Passing null as Socket.io is optional
        console.log('⚙️ [ENGINE] ROI Distribution Logic Initialized');
      } catch (engineErr) {
        console.error('⚠️ [ENGINE] ROI Worker Failed:', engineErr);
      }
    });
  } catch (err) {
    console.error('❌ [CRITICAL] Gateway Initialization Failed:', err);
    // Fallback for health checks
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ TERMINAL STARTING IN LIMITED MODE (DB OFFLINE)`);
    });
  }
};

connectGateway();

// ================================================
// 5. GLOBAL ERROR HANDLER (Prevents 500 Crashes)
// ================================================
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

// Catch unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('🚨 UNHANDLED REJECTION:', reason);
});

