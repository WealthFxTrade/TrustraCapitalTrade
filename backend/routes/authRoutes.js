// backend/routes/authRoutes.js
import express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';
import { hashPassword } from '../middleware/hashPasswordMiddleware.js';

const router = express.Router();

// ── PUBLIC ROUTES ──
// These do NOT require authentication
router.post('/login', loginUser);
router.post('/register', hashPassword, registerUser);           // ← hashes password automatically
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', hashPassword, resetPassword);   // ← also hashes new password
router.post('/logout', logoutUser);

// ── PROTECTED ROUTES ──
// Require valid JWT (cookie or Bearer token)
router.get('/profile', protect, getUserProfile);

// Optional: Add rate limiting later for security (uncomment when you add express-rate-limit)
// router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), loginUser);

export default router;
