import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  forgotPassword,  // New Controller
  resetPassword    // New Controller
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// ── SESSION MANAGEMENT ──
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

// ── SECURITY PROTOCOLS ──
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

export default router;
