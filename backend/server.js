import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Route Imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { startRoiEngine } from './workers/roiEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🛡️ SECURITY & OPTIMIZATION
app.use(helmet({ 
  contentSecurityPolicy: false, // Allows the terminal to load external assets
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));
app.use(compression()); // Compresses JSON payloads for faster terminal response
app.use(express.json());

// 🌐 CORS PROTOCOL: Trusting Vercel & Localhost
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'https://trustracapitaltrade.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`🚨 CORS REJECTION: ${origin}`);
      callback(new Error('Unauthorized Access Protocol'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🏥 IMMEDIATE HEALTH CHECK
// This MUST be before routes and DB logic to keep Render awake
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'active', 
    timestamp: new Date().toISOString(),
    node: 'Trustra-Alpha-01',
    db: mongoose.connection.readyState === 1 ? 'online' : 'reconnecting'
  });
});

// 🛰️ API GATEWAYS
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 🗄️ DATABASE HANDSHAKE & SERVER START
const connectGateway = async () => {
  try {
    // Attempting secure handshake with MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: 'trustra_main',
      serverSelectionTimeoutMS: 10000, // Fail fast if DB is down
    });
    console.log('📡 [SYSTEM] Database Handshake Successful');

    // Binding to 0.0.0.0 is mandatory for Render/Docker
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA SECURE TERMINAL ONLINE: PORT ${PORT}`);
      
      // Initialize the ROI Distribution Engine
      try {
        startRoiEngine();
        console.log('⚙️ [ENGINE] ROI Distribution Logic Initialized');
      } catch (engineErr) {
        console.error('⚠️ [ENGINE] Failed to start ROI workers:', engineErr);
      }
    });
  } catch (err) {
    console.error('❌ [CRITICAL] Gateway Initialization Failed:', err);
    
    // Emergency Fallback: Start server anyway so health checks don't fail deployment
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ TERMINAL STARTING IN LIMITED MODE (DB OFFLINE)`);
    });
  }
};

connectGateway();

// Handle Uncaught Exceptions to prevent the terminal from crashing
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION:', reason);
});
