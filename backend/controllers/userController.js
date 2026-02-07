import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/errorMiddleware.js';

/* ======================================================
   CONSTANTS
====================================================== */

export const CURRENCY = 'EUR';

export const RIO_PLANS = {
  STARTER: 'Rio Starter',
  BASIC: 'Rio Basic',
  STANDARD: 'Rio Standard',
  ADVANCED: 'Rio Advanced',
  ELITE: 'Rio Elite',
};

/* ======================================================
   HELPERS
====================================================== */

const normalizeBalances = (balances) => {
  if (balances instanceof Map) return Object.fromEntries(balances);
  return balances || { EUR: 0, BTC: 0 };
};

const calculateProfitWallet = (ledger = []) =>
  ledger
    .filter((e) =>
      ['roi_profit', 'interest', 'referral_bonus'].includes(e.type)
    )
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

/* ======================================================
   USER DASHBOARD
====================================================== */

/**
 * @desc    Get dashboard stats
 * @route   GET /api/user/dashboard
 * @access  Private
 */
export const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('balances plan isPlanActive ledger')
      .lean();

    if (!user) throw new ApiError(404, 'Investor not found');

    const balances = normalizeBalances(user.balances);
    const totalProfit = calculateProfitWallet(user.ledger);

    res.json({
      success: true,
      stats: {
        currency: CURRENCY,
        mainBalance: Number(balances.EUR || 0),
        totalProfit,
        activePlan: user.isPlanActive ? user.plan : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   PROFILE
====================================================== */

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) throw new ApiError(404, 'User not found');

    res.json({
      success: true,
      user: {
        ...user,
        balances: normalizeBalances(user.balances),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile & password
 * @route   PUT /api/user/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneContact, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) throw new ApiError(404, 'User not found');

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneContact) user.phone = phoneContact;

    if (newPassword?.trim()) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Trustra Identity Updated Successfully',
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   LEDGER & BALANCES
====================================================== */

/**
 * @desc    Get user ledger
 * @route   GET /api/user/ledger
 * @access  Private
 */
export const getUserLedger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger').lean();
    res.json({ success: true, transactions: user?.ledger || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user balances
 * @route   GET /api/user/balances
 * @access  Private
 */
export const getUserBalances = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('balances')
      .lean();

    res.json({
      success: true,
      balances: normalizeBalances(user.balances),
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   ADMIN CONTROLLERS
====================================================== */

/**
 * @desc    Admin: Approve deposit & credit EUR wallet
 * @route   POST /api/admin/deposits/approve
 * @access  Admin
 */
export const approveDeposit = async (req, res, next) => {
  try {
    const { userId, transactionId } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const tx = user.ledger.id(transactionId);
    if (!tx || tx.status !== 'pending') {
      throw new ApiError(400, 'Invalid or already processed transaction');
    }

    tx.status = 'completed';

    const current = user.balances.get(CURRENCY) || 0;
    user.balances.set(CURRENCY, current + Number(tx.amount));

    await user.save();

    res.json({ success: true, message: 'Deposit approved & credited' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const banUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ success: true, message: 'User access restricted' });
  } catch (err) {
    next(err);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ success: true, message: 'User access restored' });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   PLACEHOLDERS (ROUTER SAFETY)
====================================================== */

export const getUserById = async (req, res) =>
  res.json({ success: true });

export const updateUser = async (req, res) =>
  res.json({ success: true });

export const deleteUser = async (req, res) =>
  res.json({ success: true });

export const updateUserBalance = async (req, res) =>
  res.json({ success: true });

export const verifyUserEmail = async (req, res) =>
  res.json({ success: true });

export const resendVerificationEmail = async (req, res) =>
  res.json({ success: true });
