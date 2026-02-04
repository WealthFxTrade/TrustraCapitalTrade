import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transaction.js';
import depositRoutes from './routes/deposit.js';
import planRoutes from './routes/plan.js';

dotenv.config();

const app = express();
const IS_PROD = process.env.NODE_ENV === 'production';

/* ---------------------------------------------------
   1. CORE MIDDLEWARE
--------------------------------------------------- */
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/* ---------------------------------------------------
   2. CORS (ONLY ALLOWED FRONTENDS)
--------------------------------------------------- */
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked by Trustra Security'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

/* ---------------------------------------------------
   3. API ROUTES
--------------------------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/plan', planRoutes);

/* ---------------------------------------------------
   4. SYSTEM ROUTES
--------------------------------------------------- */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    time: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.send('Trustra Capital Trade API is active.');
});

/* ---------------------------------------------------
   5. GLOBAL 404 HANDLER
--------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server.`,
  });
});

export default app;
