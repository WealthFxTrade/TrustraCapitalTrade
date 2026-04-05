import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile // Ensure this is imported
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected
router.get('/profile', protect, getUserProfile);
// This is the missing link for the Identity Node
router.put('/update-profile', protect, updateUserProfile);

export default router;
