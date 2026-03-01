import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Route Imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { startRoiEngine } from './workers/roiEngine.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

// 🛡️ Security & Performance Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// 🌐 CORS Protocol: Trusting the Vercel Frontend
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173' // Development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Violation: Origin Unauthorized'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 🛰️ API Gateways
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health Check for Render Monitoring
app.get('/health', (req, res) => res.json({ status: 'active', version: '8.4.3' }));

// 🗄️ Database & Engine Initialization
mongoose.connect(process.env.MONGO_URI, { dbName: 'trustra_main' })
  .then(() => {
    console.log('📡 [DATABASE] Connection Established');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TRUSTRA NODE ONLINE ON PORT ${PORT}`);
      startRoiEngine(); // Starts the daily 00:00 yield distribution
    });
  })
  .catch(err => console.error('❌ DATABASE FAILURE:', err));
