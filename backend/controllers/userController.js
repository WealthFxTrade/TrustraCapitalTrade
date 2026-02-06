import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Get dashboard stats for TrustraCapitalTrade
 * Maps Main Wallet and calculates Profit Wallet from ledger
 */
export const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('balances plan ledger isPlanActive').lean();
    if (!user) throw new ApiError(404, 'User not found');

    // 1. Handle Balances (Convert Map to Object if necessary)
    const balances = user.balances instanceof Map 
      ? Object.fromEntries(user.balances) 
      : (user.balances || {});

    // 2. Calculate Profit Wallet
    // Sums all entries where type is profit-related
    const totalProfit = (user.ledger || [])
      .filter(entry => 
        entry.type === 'roi_profit' || 
        entry.type === 'interest' || 
        entry.type === 'referral_bonus'
      )
      .reduce((acc, entry) => acc + (Number(entry.amount) || 0), 0);

    // 3. Response structured for the new Dashboard UI
    res.json({
      success: true,
      stats: { 
        mainBalance: balances.USD || 0,        // Appears in "Main Wallet"
        totalProfit: totalProfit,              // Appears in "Profit Wallet"
        activePlan: user.plan || 'No Active Schema' 
      }
    });
  } catch (err) { 
    next(err); 
  }
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
 * @desc    Update user profile
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
 * @desc    Admin: Approve Deposit
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

    // Update Transaction Status
    transaction.status = 'completed';

    // Credit the Main Wallet (USD)
    const currentBalance = user.balances.get('USD') || 0;
    user.balances.set('USD', currentBalance + Number(transaction.amount));

    await user.save();
    res.json({ success: true, message: 'Deposit Approved & Main Wallet Credited' });
  } catch (err) { next(err); }
};

/**
 * @desc    Get User Ledger / Transactions
 */
export const getUserLedger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger').lean();
    // Return ledger as "transactions" for frontend compatibility
    res.json({ success: true, transactions: user.ledger || [] });
  } catch (err) { next(err); }
};

// --- REMAINING EXPORTS FOR ROUTER COMPATIBILITY ---
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

export const getUserBalances = async (req, res) => {
  const user = await User.findById(req.user.id).select('balances').lean();
  res.json({ success: true, balances: user.balances });
};

export const getUserById = async (req, res) => res.json({ success: true });
export const updateUser = async (req, res) => res.json({ success: true });
export const deleteUser = async (req, res) => res.json({ success: true });
export const updateUserBalance = async (req, res) => res.json({ success: true });
export const banUser = async (req, res) => res.json({ success: true });
export const unbanUser = async (req, res) => res.json({ success: true });
export const verifyUserEmail = async (req, res) => res.json({ success: true });
export const resendVerificationEmail = async (req, res) => res.json({ success: true });

