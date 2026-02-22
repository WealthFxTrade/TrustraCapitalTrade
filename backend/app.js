import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/error.js';

// ─── Route Imports ───
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import marketRoutes from './routes/market.js';
import adminRoutes from './routes/adminRoutes.js';
// ... other imports

const app = express();

// ─── SECURITY & CORS ───
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(helmet({
  contentSecurityPolicy: false, // Set to false if using external APIs like CoinGecko/BlockCypher to avoid header conflicts
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.options('*', cors()); // Enable pre-flight for all routes

// ─── RATE LIMITING (Node Security) ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for dashboard polling
  message: { success: false, message: 'Node Traffic High: Try again in 15 mins.' }
});
app.use('/api/', limiter);

// ─── GENERAL MIDDLEWARE ───
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── HEALTH CHECK ───
app.get('/health', (req, res) => {
  res.json({
    success: true,
    node: 'Trustra_Secure_Gateway_v8.4.1',
    status: 'Online',
    timestamp: new Date().toISOString()
  });
});

// ─── API ROUTES ───
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);
// ... mount other routes here

// ─── ERROR HANDLERS ───
app.use(notFound);
app.use(errorHandler);

export default app; // Use default export for server.js

