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
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ====================== PUBLIC ROUTES ====================== */

// Registration
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', logoutUser);

// Password Recovery
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Token Refresh
router.post('/refresh', refreshSession);

/* ====================== PROTECTED ROUTES ====================== */

// Profile
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
