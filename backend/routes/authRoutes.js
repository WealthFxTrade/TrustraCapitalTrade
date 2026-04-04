// routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginUser,
  registerUser,
  getUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── RATE LIMITERS ──
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many password reset requests. Please try again later.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many registration attempts. Please try again later.' },
});

// ── HEALTH CHECK ──
router.get('/health', (req, res) => {
  res.json({ status: 'Auth System Online', timestamp: new Date().toISOString() });
});

// ── PUBLIC AUTH ENDPOINTS ──
router.post('/register', registerLimiter, registerUser);
router.post('/signup', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// ── PROTECTED ENDPOINTS ──
router.get('/profile', protect, getUserProfile);
router.post('/logout', protect, logoutUser);

export default router;
