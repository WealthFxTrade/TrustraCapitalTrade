import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

// -----------------------------
// CORS: allow only your live frontend + local dev
// -----------------------------
const allowedOrigins = [
  'https://trustra-capital-trade.vercel.app', // Live frontend
  'http://localhost:5173',                    // Vite default dev port
  'http://localhost:3000'                     // If using Create React App locally
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl/Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  },
  credentials: true, // Allow cookies/sessions if needed later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// -----------------------------
// JSON body parser
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health check (for Render/Netlify to verify backend is alive)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TrustraCapitalTrade Backend is running!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root route (optional – nice for testing)
app.get('/', (req, res) => {
  res.send('TrustraCapitalTrade Backend – API is live at /api/health');
});

// -----------------------------
// MongoDB connection
// -----------------------------
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// -----------------------------
// Global error handler (optional but good for prod)
// -----------------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
