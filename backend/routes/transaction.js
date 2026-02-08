import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/transactions/deposit
 * @desc    Get deposit instructions (EUR focus)
 */
router.post('/deposit', protect, async (req, res, next) => {
  try {
    const { amount, currency = 'EUR' } = req.body;
    
    // In production, this address would be derived from the user's btcAddress field
    const depositAddress = req.user.btcAddress || "bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq";

    req.user.ledger.push({
      amount,
      currency,
      type: 'deposit',
      status: 'pending', 
      description: `Awaiting €${amount} payment to ${depositAddress}`,
      createdAt: new Date()
    });

    await req.user.save();
    res.json({ 
      success: true, 
      address: depositAddress, 
      amount,
      message: "Please send the exact amount to the address provided."
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/transactions/withdraw
 * @desc    Submit a withdrawal request (Deducts EUR)
 */
router.post('/withdraw', protect, async (req, res, next) => {
  try {
    const { amount, walletAddress, currency = 'EUR' } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Check EUR balance (Consistency with your plans.js)
    const available = user.balances.get('EUR') || 0;
    if (amount > available) {
      throw new ApiError(400, `Insufficient EUR balance. Available: €${available}`);
    }

    // 2. Deduct immediately (Lock funds)
    user.balances.set('EUR', available - amount);

    // 3. Log to ledger
    user.ledger.push({
      amount: -amount, // Negative to represent outflow
      currency,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to ${walletAddress}`,
      createdAt: new Date()
    });

    await user.save();
    res.json({ 
      success: true, 
      message: "Withdrawal request submitted for review",
      remainingBalance: user.balances.get('EUR')
    });
  } catch (err) {
    next(err);
  }
});

export default router;

