/**
 * server.js - Trustra Node v8.4.1 
 * Production Entry Point
 */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

// Route Imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ── MIDDLEWARE ──
app.use(helmet()); 
app.use(cors({ origin: '*', credentials: true })); // Adjusted for Termux/Local testing
app.use(compression()); 
app.use(morgan('dev'));
app.use(express.json());

// ── API ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ── HEALTH CHECK ──
app.get('/health', (req, res) => {
  res.json({ status: 'online', uptime: process.uptime() });
});

// ── ERROR HANDLING ──
app.use(notFound);
app.use(errorHandler);

// ── DB & SERVER START ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connection: Established');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Trustra Node Online: Port ${PORT}`);
    });

    // Initialize Socket.io (using dependency socket.io ^4.8.3)
    const io = new Server(server, { cors: { origin: "*" } });
    app.set('socketio', io);
  })
  .catch(err => console.error('❌ DB Connection Error:', err));
