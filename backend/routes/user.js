import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/* --- PROFILE GET (Fixes the Error) --- */
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) throw new ApiError(404, 'User not found');

    // Convert Map to Object for JSON compatibility
    const balances = user.balances ? 
      (user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances) : 
      { BTC: 0, USD: 0, USDT: 0 };

    res.json({
      success: true,
      user: {
        ...user,
        balances // Ensure balances are sent as a clean object
      }
    });
  } catch (err) {
    next(err);
  }
});

/* --- PROFILE UPDATE (Fixes Save Changes) --- */
router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
});

/* --- BALANCE --- */
router.get('/balance', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('balances').lean();
    const b = user.balances || {};
    const data = {
      BTC: (b instanceof Map ? b.get('BTC') : b.BTC) ?? 0,
      USD: (b instanceof Map ? b.get('USD') : b.USD) ?? 0,
      USDT: (b instanceof Map ? b.get('USDT') : b.USDT) ?? 0
    };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/* --- TRANSACTIONS --- */
router.get('/transactions/my', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    res.json({ success: true, data: user.ledger.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) {
    next(err);
  }
});

// IMPORTANT: Re-add Login/Register routes here as well if they were in this file
export default router;

