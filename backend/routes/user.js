import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * 1. PROFILE GET (Aligns with /api/user/me)
 */
router.get('/user/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) throw new ApiError(404, 'User not found');

    const balances = user.balances instanceof Map
      ? Object.fromEntries(user.balances)
      : (user.balances || { BTC: 0, USD: 0, USDT: 0 });

    res.json({
      success: true,
      user: { ...user, balances }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. PROFILE PUT (Fixes "Route not found: PUT /api/user/me")
 * Handles the profile update from your UI
 */
router.put('/user/me', protect, async (req, res, next) => {
  try {
    const { fullName, email, phoneContact } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          fullName, 
          email, 
          phoneContact 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updatedUser) throw new ApiError(404, 'User not found');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. BALANCE GET (Aligns with /api/user/balance)
 */
router.get('/user/balance', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('balances').lean();
    if (!user) throw new ApiError(404, 'User not found');
    
    const b = user.balances || {};
    const data = {
      BTC: (b instanceof Map ? b.get('BTC') : b.BTC) ?? 0,
      USD: (b instanceof Map ? b.get('USD') : b.USD) ?? 0,
      USDT: (b instanceof Map ? b.get('USDT') : b.USDT) ?? 0
    };
    res.json({ success: true, balance: data.USD, data });
  } catch (err) {
    next(err);
  }
});

/**
 * 4. TRANSACTIONS GET (Aligns with /api/transactions/my)
 */
router.get('/transactions/my', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    if (!user) throw new ApiError(404, 'User not found');
    
    res.json({
      success: true,
      transactions: (user.ledger || []).sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (err) {
    next(err);
  }
});

export default router;

