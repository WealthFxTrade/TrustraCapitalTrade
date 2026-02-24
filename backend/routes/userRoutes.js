import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
