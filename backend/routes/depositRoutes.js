import express from 'express';
import {
  createDeposit,
  getUserDeposits,
  getAllDeposits,
  manualConfirmDeposit,
  getOrCreateBtcDepositAddressController
} from '../controllers/depositController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import adminOnly from '../middlewares/adminOnly.js';

const router = express.Router();

// User routes
router.post('/', authMiddleware, createDeposit);
router.get('/my', authMiddleware, getUserDeposits);
router.get('/btc-address', authMiddleware, getOrCreateBtcDepositAddressController);

// Admin routes
router.get('/', authMiddleware, adminOnly, getAllDeposits);
router.post('/:depositId/confirm', authMiddleware, adminOnly, manualConfirmDeposit);

export default router;
