// server.js - Trustra Capital Trade Backend Entry Point
// Zurich Mainnet Core - Express + Socket.IO + MongoDB

import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

// ── Internal Imports ────────────────────────────────────────────────────────────────
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initRioEngine } from './utils/rioEngine.js';
import { watchBtcDeposits } from './utils/btcWatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────
//  ENVIRONMENT LOADING WITH DEBUG
// ────────────────────────────────────────────────────────────────
console.log('=== ENV LOADING DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('Looking for .env at:', path.resolve(process.cwd(), '.env'));

let dotenvResult = null;

try {
  console.log('Importing dotenv...');
  const dotenv = await import('dotenv');
  console.log('dotenv imported successfully');

  const envPath = path.resolve(process.cwd(), '.env');
  dotenvResult = dotenv.config({ path: envPath, debug: true });

  if (dotenvResult.error) {
    console.error('dotenv.config FAILED:', dotenvResult.error.message);
    console.error('Full error:', dotenvResult.error);
  } else {
    console.log('dotenv.config SUCCESS');
    console.log('Parsed keys from .env:', Object.keys(dotenvResult.parsed || {}));
  }
} catch (err) {
  console.error('Failed to import or run dotenv:', err.message);
  console.error('Full error:', err);
}

// Fallbacks if dotenv fails (remove in real production)
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '10000';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TrustraCapitalFx:Kayblizz2015@trustracapitalfx.w2mghdv.mongodb.net/TrustraCapitalTrade?retryWrites=true&w=majority';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-testing-only';
process.env.JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

console.log('Environment after load:');
console.log('  NODE_ENV     :', process.env.NODE_ENV);
console.log('  PORT         :', process.env.PORT);
console.log('  MONGO_URI    :', process.env.MONGO_URI ? 'present' : '(missing)');
console.log('  FRONTEND_URL :', process.env.FRONTEND_URL ? 'present' : '(missing)');
console.log('  JWT_SECRET   :', process.env.JWT_SECRET ? 'present' : '(missing)');
console.log('  JWT_EXPIRES  :', process.env.JWT_EXPIRES ? 'present' : '(missing)');
console.log('=== ENV LOADING DEBUG END ===');

// ────────────────────────────────────────────────────────────────
//  REQUIRED ENVIRONMENT VARIABLES – FAIL FAST
// ────────────────────────────────────────────────────────────────
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'FRONTEND_URL',
  'JWT_SECRET',
  'JWT_EXPIRES',
];

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('╔════════════════════════════════════════════════════════════╗');
  console.error('║                 CRITICAL STARTUP ERROR                     ║');
  console.error(`║ Missing required env vars: ${missing.join(', ')}`);
  console.error('║ → Add them in your hosting platform dashboard (Render/Vercel/etc.)');
  console.error('╚════════════════════════════════════════════════════════════╝');
  process.exit(1);
}

// Security warning
if (process.env.NODE_ENV === 'production') {
  if (process.env.ETH_MNEMONIC) {
    console.error('!!! CRITICAL SECURITY VIOLATION !!!');
    console.error('ETH_MNEMONIC is present in environment variables.');
    console.error('→ Immediate funds-at-risk. Move to isolated signer / MPC / user-signed transactions.');
  }
  if (process.env.ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY detected – ensure it is rotated regularly and never logged.');
  }
}

// ── Express Application Setup ───────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);

const httpServer = createServer(app);

// ── Database Connection ─────────────────────────────────────────────────────────────
connectDB();

// ── Security & Parsing Middleware ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── CORS Configuration ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true, // Allows any origin (good for local dev; restrict in production)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204,
  })
);

// Morgan logging – only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Socket.IO Server Setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  if (userId) {
    socket.join(userId.toString());
    console.log(`📡 Node Synced: ${userId}`);
  }
  socket.on('disconnect', () => console.log('🔌 Node Offline'));
});

// ── API Routes ──────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// ── Automation Engines ──────────────────────────────────────────────────────────────
initRioEngine(io);

setInterval(() => {
  watchBtcDeposits(io);
}, 5 * 60 * 1000);

// ── Serve Frontend Static Files ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ status: 'Online', mode: 'Development' }));
}

// ── Error Handling Middleware ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 10000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TRUSTRA CORE LIVE | PORT: \( {PORT} | ENV: \){process.env.NODE_ENV || 'development'}`);
});
