import express from 'express';
import { 
  getUserProfile, 
  getMyDepositAddress, 
  updatePassword, 
  uploadKYC, 
  deleteUser, 
  getAllUsers, 
  updateUser 
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/User Routes
router.get('/profile', protect, getUserProfile);
router.get('/deposit-address', protect, getMyDepositAddress);
router.put('/update-password', protect, updatePassword);
router.post('/kyc-upload', protect, uploadKYC);

// Admin Routes
router.get('/all', protect, admin, getAllUsers);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

export default router;
