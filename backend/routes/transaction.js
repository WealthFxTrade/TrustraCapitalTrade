import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

// @route   POST /api/transactions/deposit
// @desc    Get deposit instructions and log pending intent
router.post('/deposit', protect, async (req, res) => {
  const { amount, currency } = req.body;
  
  // Static admin wallet (In 2026, use a dynamic gateway API like BVNK for automation)
  const depositAddress = "bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq";

  req.user.ledger.push({
    amount,
    currency,
    type: 'deposit',
    status: 'pending', // Awaiting admin confirmation
    description: `Awaiting payment to ${depositAddress}`
  });

  await req.user.save();
  res.json({ success: true, address: depositAddress, amount });
});

// @route   POST /api/transactions/withdraw
// @desc    Submit a withdrawal request
router.post('/withdraw', protect, async (req, res) => {
  const { amount, walletAddress, currency } = req.body;
  const user = await User.findById(req.user.id);

  const available = user.balances.get('USD') || 0;
  if (amount > available) throw new ApiError(400, "Insufficient balance");

  // Deduct immediately to prevent double-spending
  user.balances.set('USD', available - amount);
  
  user.ledger.push({
    amount,
    currency,
    type: 'withdrawal',
    status: 'pending',
    description: `Withdrawal to ${walletAddress}`
  });

  await user.save();
  res.json({ success: true, message: "Withdrawal request submitted" });
});

export default router;

