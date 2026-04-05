import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── PUBLIC ROUTES ──
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// ── PROTECTED ROUTES ──
// Requires a valid 'trustra_token' cookie or Bearer header
router.get('/profile', protect, getUserProfile);

export default router;
