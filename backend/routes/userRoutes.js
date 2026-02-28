import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getProfile, 
  updateProfile, 
  getAllUsers,
  getMyDepositAddress,
  updateUserStatus,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

/**
 * ─── INVESTOR ROUTES ───
 * Standard user operations
 */
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

/**
 * @desc    Get/Generate unique deterministic deposit address
 * @route   GET /api/user/deposit-address
 * @access  Private
 */
router.get('/deposit-address', protect, getMyDepositAddress);

/**
 * ─── ADMINISTRATIVE ROUTES ───
 * Only accessible by users with role: 'admin'
 */
router.get('/all', protect, admin, getAllUsers);
router.patch('/status/:id', protect, admin, updateUserStatus);
router.delete('/:id', protect, admin, deleteUser);

export default router;
