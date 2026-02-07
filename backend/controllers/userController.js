import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Get dashboard stats for TrustraCapitalTrade
 */
export const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('balances plan ledger isPlanActive').lean();
    if (!user) throw new ApiError(404, 'Investor not found');

    const balances = user.balances instanceof Map
      ? Object.fromEntries(user.balances)
      : (user.balances || {});

    // Calculate Profit Wallet by summing ROI and Interest entries
    const totalProfit = (user.ledger || [])
      .filter(entry => 
        entry.type === 'roi_profit' || 
        entry.type === 'interest' || 
        entry.type === 'referral_bonus'
      )
      .reduce((acc, entry) => acc + (Number(entry.amount) || 0), 0);

    res.json({
      success: true,
      stats: {
        mainBalance: balances.USD || 0,
        totalProfit: totalProfit,
        activePlan: user.plan || 'No Active Schema'
      }
    });
  } catch (err) { next(err); }
};

/**
 * @desc    Get user profile 
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) throw new ApiError(404, 'User not found');

    const balances = user.balances instanceof Map
      ? Object.fromEntries(user.balances)
      : (user.balances || { BTC: 0, USD: 0, USDT: 0 });

    res.json({ success: true, user: { ...user, balances } });
  } catch (err) { next(err); }
};

/**
 * @desc    Update user profile & password
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneContact, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');

    // Update Basic Info
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneContact) user.phone = phoneContact;

    // Secure Password Update logic
    if (newPassword && newPassword.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    
    res.json({ 
      success: true, 
      message: "Trustra Identity Updated Successfully",
      user: { fullName: user.fullName, email: user.email } 
    });
  } catch (err) { next(err); }
};

/**
 * @desc    Admin: Approve Deposit & Credit Main Wallet
 */
export const approveDeposit = async (req, res, next) => {
  try {
    const { userId, transactionId } = req.body;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const transaction = user.ledger.id(transactionId);
    if (!transaction || transaction.status !== 'pending') {
      throw new ApiError(400, 'Invalid or already processed transaction');
    }

    transaction.status = 'completed';

    // Credit the Main Wallet (USD Map)
    const currentBalance = user.balances.get('USD') || 0;
    user.balances.set('USD', currentBalance + Number(transaction.amount));

    await user.save();
    res.json({ success: true, message: 'Deposit Approved & Funds Released' });
  } catch (err) { next(err); }
};

/**
 * @desc    Get User Ledger / Transactions
 */
export const getUserLedger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger').lean();
    res.json({ success: true, transactions: user.ledger || [] });
  } catch (err) { next(err); }
};

// --- REMAINING EXPORTS FOR ADMIN UTILITIES ---
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt').lean();
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

export const banUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ success: true, message: "User Access Restricted" });
  } catch (err) { next(err); }
};

export const unbanUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ success: true, message: "User Access Restored" });
  } catch (err) { next(err); }
};

export const getUserBalances = async (req, res) => {
  const user = await User.findById(req.user.id).select('balances').lean();
  res.json({ success: true, balances: user.balances });
};

// Placeholder handlers for router compatibility
export const getUserById = async (req, res) => res.json({ success: true });
export const updateUser = async (req, res) => res.json({ success: true });
export const deleteUser = async (req, res) => res.json({ success: true });
export const updateUserBalance = async (req, res) => res.json({ success: true });
export const verifyUserEmail = async (req, res) => res.json({ success: true });
export const resendVerificationEmail = async (req, res) => res.json({ success: true });

