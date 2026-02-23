import express from 'express';
import {
  getUserStats,
  getUserProfile,
  getUserLedger,
  updateUserProfile,
  approveDeposit,
  getUsers,
  updateUserBalance,
  distributeProfit,
  banUser,
  unbanUser,
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ────────────── USER ROUTES ──────────────
router.get('/stats', protect, getUserStats);
router.get('/profile', protect, getUserProfile);
router.get('/transactions', protect, getUserLedger);

router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ────────────── ADMIN ROUTES ──────────────
router.get('/', protect, admin, getUsers);
router.put('/distribute/:id', protect, admin, distributeProfit);
router.post('/approve-deposit', protect, admin, approveDeposit);

router.route('/:id')
  .get(protect, admin, getUserStats)
  .put(protect, admin, updateUserBalance);

router.put('/:id/ban', protect, admin, banUser);
router.put('/:id/unban', protect, admin, unbanUser);

// 🚨 THIS IS THE CRITICAL LINE THAT WAS MISSING 🚨
export default router; 

