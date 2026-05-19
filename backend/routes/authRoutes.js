// backend/routes/authRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  refreshSession,
  authorizeSession,      // ← NEW
  establishSession,      // ← NEW
  verifySession,         // ← NEW
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ====================== PUBLIC ROUTES ====================== */

// Registration
router.post('/register', registerUser);

// Standard Login
router.post('/login', loginUser);

// Custom Session Authorization (used by your frontend)
router.post('/authorize-session', authorizeSession);
router.post('/establish-session', establishSession);
router.post('/verify-session', verifySession);

// Logout
router.post('/logout', logoutUser);

// Password Recovery
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Token Refresh
router.post('/refresh', refreshSession);

/* ====================== PROTECTED ROUTES ====================== */
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
