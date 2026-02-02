import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';
import {
  getOrCreateBtcDepositAddressController,
  getDepositHistory,
} from '../controllers/depositController.js';

const router = express.Router();

// Get or create BTC deposit address
router.get(
  '/btc',
  protect,
  asyncHandler(getOrCreateBtcDepositAddressController)
);

// Force generate a new BTC deposit address
router.get(
  '/btc/new',
  protect,
  (req, res, next) => {
    req.query.fresh = 'true'; // indicate fresh address
    next();
  },
  asyncHandler(getOrCreateBtcDepositAddressController)
);

// Get BTC deposit history / ledger
router.get(
  '/btc/history',
  protect,
  asyncHandler(getDepositHistory)
);

export default router;
