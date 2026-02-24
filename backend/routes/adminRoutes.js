import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAllUsers, updateUserStatus, deleteUser } from '../controllers/userController.js';
import { getAllWithdrawals, updateWithdrawalStatus } from '../controllers/withdrawalController.js';

const router = express.Router();

router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUserStatus);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.put('/withdrawals/:id', protect, admin, updateWithdrawalStatus);

export default router;
