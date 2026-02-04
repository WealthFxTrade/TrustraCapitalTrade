import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transaction.js';

dotenv.config();
const app = express();

// 1. Production Middleware
app.use(cors({
  origin: ["https://trustra-capital-trade.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// 2. The Root "Welcome" Route (Fixes the GET / 404)
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: "Trustra Capital API – Secure Gateway Active",
    env: process.env.NODE_ENV 
  });
});

// 3. Health Check for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

// 4. API Route Mounting (Ensures /api/auth/login works)
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 5. Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 10000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
});

