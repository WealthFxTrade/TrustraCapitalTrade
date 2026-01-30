import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import planRoutes from './routes/plan.js';
import depositRoutes from './routes/deposit.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/deposit', depositRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Trustra Capital Trade Backend is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

export default app;
