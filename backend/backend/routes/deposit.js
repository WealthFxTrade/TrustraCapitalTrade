import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js'; // Ensure this path is correct
import {
  getOrCreateBtcDepositAddressController,
  getDepositHistory,
} from '../controllers/depositController.js';

const router = express.Router();

<<<<<<< HEAD:backend/backend/routes/deposit.js
router.get('/btc', protect, asyncHandler(getOrCreateBtcDepositAddressController));
=======
// GET /api/deposits/btc -> Get current BTC address
router.get(
  '/btc',
  protect,
  asyncHandler(getOrCreateBtcDepositAddressController)
);

// GET /api/deposits/btc/new -> Force generate new BTC address
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested):routes/deposit.js
router.get(
  '/btc/new',
  protect,
  (req, res, next) => {
<<<<<<< HEAD:backend/backend/routes/deposit.js
    req.query.fresh = 'true';
=======
    req.query.fresh = 'true'; 
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested):routes/deposit.js
    next();
  },
  asyncHandler(getOrCreateBtcDepositAddressController)
);
<<<<<<< HEAD:backend/backend/routes/deposit.js
router.get('/btc/history', protect, asyncHandler(getDepositHistory));
=======

// GET /api/deposits/btc/history -> Get BTC ledger
router.get(
  '/btc/history',
  protect,
  asyncHandler(getDepositHistory)
);
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested):routes/deposit.js

export default router;

