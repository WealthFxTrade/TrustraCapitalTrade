import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';

import {
  getBtcAddress,
  getDepositAddress // ✅ NEW
} from '../controllers/walletController.js';

const router = express.Router();

/**
 * 🔐 GLOBAL AUTH PROTECTION
 */
router.use(protect);

/**
 * 🟢 WALLET HEALTH
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    return res.status(200).json({
      success: true,
      service: 'wallet',
      status: 'online',
      user: {
        id: req.user._id,
        email: req.user.email,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * 🔥 UNIFIED ADDRESS ENDPOINT (CRITICAL FIX)
 * This is what your frontend NEEDS
 *
 * GET /api/wallet/address?asset=BTC|ETH|USDT
 */
router.get('/address', asyncHandler(getDepositAddress));

/**
 * 🟠 BTC LEGACY ENDPOINT (KEEP FOR BACKWARD COMPATIBILITY)
 */
router.get('/btc-address', asyncHandler(getBtcAddress));

/**
 * 🔵 FUTURE
 */
// router.get('/eth-address', asyncHandler(getEthAddress));

/**
 * ❌ FALLBACK
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Wallet route not found',
  });
});

export default router;
