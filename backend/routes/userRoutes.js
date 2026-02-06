import express from 'express';
const router = express.Router();
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  approveDeposit,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBalances,
  updateUserBalance,
  getUserLedger,
  banUser,
  unbanUser,
  verifyUserEmail,
  resendVerificationEmail,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/user/dashboard', protect, getUserDashboard);
router.route('/user/me').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/user/balance', protect, getUserBalances);
router.get('/transactions/my', protect, getUserLedger);
router.post('/users/approve-deposit', protect, admin, approveDeposit);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser);
router.put('/users/:id/balance', protect, admin, updateUserBalance);
router.put('/users/:id/ban', protect, admin, banUser);
router.put('/users/:id/unban', protect, admin, unbanUser);

export default router;

