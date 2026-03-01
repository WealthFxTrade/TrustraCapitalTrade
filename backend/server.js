import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ── ROUTES ──
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// ── MODELS & WORKERS ──
import User from './models/User.js';
import { startRoiEngine } from './workers/roiEngine.js'; // Path verified: ./workers/roiEngine.js

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 10000;

// ── 1. PRODUCTION MIDDLEWARE ──
app.use(helmet({
  contentSecurityPolicy: false, // Essential for React Router & External Assets
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression()); // Compresses responses for faster mobile loading
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── 2. API ENDPOINTS ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// System Health Check
app.get('/health', (req, res) => res.json({
  status: 'active',
  version: '8.4.3',
  node: process.version,
  timestamp: new Date().toISOString()
}));

// ── 3. STATIC FRONTEND DELIVERY ──
// Points to the 'dist' folder created by 'npm run build' in the frontend directory
const frontendPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(frontendPath));

// Catch-all route: Redirects all non-API requests to React's index.html
// This fixes the "404 on Refresh" issue common in Single Page Applications (SPA)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'System Error: API Route Not Found' });
  }
  res.sendFile(path.resolve(frontendPath, 'index.html'));
});

// ── 4. INITIALIZATION PROTOCOL ──



mongoose.connect(process.env.MONGO_URI, { dbName: 'trustra_main' })
  .then(() => {
    console.log('📡 [DATABASE] Connection established with Trustra Master Node.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
      -----------------------------------------------
      🚀 TRUSTRA V8.4.3 PRODUCTION NODE ONLINE
      📡 Port: ${PORT}
      🛠️  Environment: ${process.env.NODE_ENV || 'production'}
      🕒 Startup: ${new Date().toLocaleString()}
      -----------------------------------------------
      `);

      // Initialize the ROI Engine after DB is confirmed live
      try {
        startRoiEngine();
        console.log('✅ [ENGINE] Automated Yield Protocol: ACTIVE');
      } catch (err) {
        console.error('❌ [ENGINE] Automated Yield Protocol: FAILED TO START', err);
      }
    });
  })
  .catch(err => {
    console.error('❌ [CRITICAL] DATABASE HANDSHAKE FAILED:', err);
    process.exit(1);
  });

// Global Safety Net for Unhandled Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('⚠️ [WARNING] Unhandled Rejection at:', promise, 'reason:', reason);
});
