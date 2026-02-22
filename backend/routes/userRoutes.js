import express from 'express';
import {
  getUserStats,        // Renamed to match frontend call
  getUserProfile,      // Added for the profile view
  getUserLedger,
  updateUserProfile,
  approveDeposit,
  getUsers,
  updateUserBalance,
  distributeProfit,    // Added for Admin.jsx build fix
  banUser,
  unbanUser,
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ────────────── USER ROUTES (authenticated users only) ──────────────

// Matches Dashboard.jsx: api.get('/user/stats')
router.get('/stats', protect, getUserStats); 

// Matches AuthContext.jsx: api.get('/auth/profile') or api.get('/user/profile')
router.get('/profile', protect, getUserProfile);

router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Matches UserContext.jsx: api.get('/user/transactions')
router.get('/transactions', protect, getUserLedger);


// ────────────── ADMIN ROUTES (admin only) ──────────────

// Matches Admin.jsx: api.get('/user')
router.get('/', protect, admin, getUsers);

// Matches Admin.jsx: api.put(`/user/distribute/${id}`, payload)
router.put('/distribute/:id', protect, admin, distributeProfit);

// Standard Admin Updates
router.post('/approve-deposit', protect, admin, approveDeposit);

router.route('/:id')
  .get(protect, admin, getUserStats) 
  .put(protect, admin, updateUserBalance)
  .delete(protect, admin, (req, res) => res.status(501).json({ message: 'Delete not implemented' }));

// Specific Admin Actions
router.put('/:id/ban', protect, admin, banUser);
router.put('/:id/unban', protect, admin, unbanUser);

export default router;

