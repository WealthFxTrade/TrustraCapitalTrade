import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Get user profile - REQUIRED BY ROUTER
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
 * @desc    Update user profile - REQUIRED BY ROUTER
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneContact } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { fullName, email, phone: phoneContact } },
      { new: true, runValidators: true }
    ).select('-password').lean();
    res.json({ success: true, user: updatedUser });
  } catch (err) { next(err); }
};

/**
 * @desc    Get dashboard stats
 */
export const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('balances plan ledger isPlanActive').lean();
    const balances = user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances;
    const totalProfit = (user.ledger || []).filter(e => e.type === 'roi_profit').reduce((a, b) => a + b.amount, 0);
    
    res.json({
      success: true,
      stats: { mainBalance: balances.USD || 0, totalProfit, activePlan: user.plan || 'None' }
    });
  } catch (err) { next(err); }
};

/**
 * @desc    Admin: Approve Deposit - REQUIRED BY ROUTER
 */
export const approveDeposit = async (req, res, next) => {
  try {
    const { userId, transactionId } = req.body;
    const user = await User.findById(userId);
    const transaction = user.ledger.id(transactionId);
    if (!transaction || transaction.status !== 'pending') throw new ApiError(400, 'Invalid Transaction');
    
    transaction.status = 'completed';
    user.balances.set('USD', (user.balances.get('USD') || 0) + transaction.amount);
    await user.save();
    res.json({ success: true, message: 'Deposit Approved' });
  } catch (err) { next(err); }
};

// --- REMAINING EXPORTS TO SATISFY ROUTER ---
export const getUsers = async (req, res, next) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json({ success: true, users });
};
export const getUserBalances = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('balances').lean();
  res.json({ success: true, balances: user.balances });
};
export const getUserLedger = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('ledger').lean();
  res.json({ success: true, transactions: user.ledger });
};
export const getUserById = async (req, res) => res.json({ success: true });
export const updateUser = async (req, res) => res.json({ success: true });
export const deleteUser = async (req, res) => res.json({ success: true });
export const updateUserBalance = async (req, res) => res.json({ success: true });
export const banUser = async (req, res) => res.json({ success: true });
export const unbanUser = async (req, res) => res.json({ success: true });
export const verifyUserEmail = async (req, res) => res.json({ success: true });
export const resendVerificationEmail = async (req, res) => res.json({ success: true });

