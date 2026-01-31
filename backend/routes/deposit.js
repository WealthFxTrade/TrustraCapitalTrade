import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';
import {
  getOrCreateBtcDepositAddressController,
  getDepositHistory,
} from '../controllers/depositController.js';

const router = express.Router();

router.get('/btc', protect, asyncHandler(getOrCreateBtcDepositAddressController));
router.get(
  '/btc/new',
  protect,
  (req, res, next) => {
    req.query.fresh = 'true';
    next();
  },
  asyncHandler(getOrCreateBtcDepositAddressController)
);
router.get('/btc/history', protect, asyncHandler(getDepositHistory));

export default router;
