import express from 'express';
const router = express.Router();

// Controller Imports
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

// Middleware
import { protect } from '../middleware/authMiddleware.js';

/**
 * ── SESSION MANAGEMENT ──
 */
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

/**
 * ── SECURITY PROTOCOLS ──
 */
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

// 🚨 ENSURE THIS LINE IS AT THE VERY BOTTOM
export default router;
