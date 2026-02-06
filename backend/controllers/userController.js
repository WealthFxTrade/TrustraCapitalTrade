import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/user/me
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) throw new ApiError(404, 'User not found');

    // Convert Mongoose Map to standard Object for Frontend
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
};

/**
 * @desc    Update user profile
 * @route   PUT /api/user/me
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneContact } = req.body;

    // Map UI "phoneContact" to Model "phone"
    const updateData = {
      fullName,
      email,
      phone: phoneContact // Mapping the names
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
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
};

/**
 * @desc    Get current user's balances
 * @route   GET /api/user/balance
 */
export const getUserBalances = async (req, res, next) => {
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
};

/**
 * @desc    Get user's transaction history
 * @route   GET /api/transactions/my
 */
export const getUserLedger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger').lean();
    if (!user) throw new ApiError(404, 'User not found');

    const transactions = (user.ledger || []).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────
// Admin Controllers
// ────────────────────────────────────────────────

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

export const updateUserBalance = async (req, res, next) => {
  try {
    const { currency, amount } = req.body; // e.g., { "currency": "USD", "amount": 100 }
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.balances.set(currency, amount);
    await user.save();

    res.json({ success: true, balances: Object.fromEntries(user.balances) });
  } catch (err) { next(err); }
};

export const banUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { banned: true });
    res.json({ success: true, message: 'User banned' });
  } catch (err) { next(err); }
};

export const unbanUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { banned: false });
    res.json({ success: true, message: 'User unbanned' });
  } catch (err) { next(err); }
};

// ────────────────────────────────────────────────
// Auth/Verification placeholders
// ────────────────────────────────────────────────
export const verifyUserEmail = async (req, res, next) => { res.send('Email Verified'); };
export const resendVerificationEmail = async (req, res, next) => { res.send('Email Resent'); };

