import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Get dashboard metrics (Stats & Balances)
 * @route   GET /api/users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Handle Mongoose Map to Object conversion for the frontend
  const balances = user.balances instanceof Map
    ? Object.fromEntries(user.balances)
    : user.balances;

  res.json({
    success: true,
    stats: {
      balances,
      activePlan: user.activePlan || 'Class III: Prime',
      kycStatus: user.kycStatus || 'unverified',
      totalDeposits: user.totalDeposits || 0
    }
  });
});

/**
 * @desc    Get Transaction Ledger (Audit History)
 * @route   GET /api/users/transactions
 */
export const getLedger = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, transactions });
});

/**
 * @desc    Strategic Yield Reinvestment (Compound)
 * @route   POST /api/users/compound
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const currentROI = user.balances.get('ROI') || 0;

  if (currentROI < 10) {
    return res.status(400).json({ 
      success: false, 
      message: 'Minimum €10.00 required for reinvestment.' 
    });
  }

  const currentEUR = user.balances.get('EUR') || 0;
  user.balances.set('EUR', currentEUR + currentROI);
  user.balances.set('ROI', 0);
  await user.save();

  await Transaction.create({
    user: user._id,
    type: 'reinvest',
    amount: currentROI,
    currency: 'EUR',
    status: 'completed',
    description: 'Yield Maturity: ROI Reinvestment to Principal',
    method: 'internal'
  });

  res.json({ success: true, message: 'Reinvestment finalized.' });
});

/**
 * @desc    Process Withdrawal Request
 * @route   POST /api/users/withdraw
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, address, currency } = req.body;
  const user = await User.findById(req.user._id);
  
  const balanceKey = currency || 'EUR';
  const currentBalance = user.balances.get(balanceKey) || 0;

  if (currentBalance < amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Insufficient vaulted liquidity.' 
    });
  }

  // Deduct from balance immediately to prevent double spending
  user.balances.set(balanceKey, currentBalance - amount);
  await user.save();

  const tx = await Transaction.create({
    user: user._id,
    type: 'withdrawal',
    amount,
    currency: balanceKey,
    walletAddress: address,
    status: 'pending',
    description: `Withdrawal request to ${address.slice(0, 8)}...`,
    method: 'crypto'
  });

  res.json({ success: true, transaction: tx });
});

/**
 * @desc    Get Institutional Deposit Address
 * @route   GET /api/users/deposit-address
 */
export const getDepositAddress = asyncHandler(async (req, res) => {
  // Ensure we capture 'asset' from req.query (e.g. ?asset=BTC)
  const { asset } = req.query;
  
  const vaultMap = {
    USDT: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Institutional ERC20
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  };

  const selectedAsset = asset?.toUpperCase() || 'USDT';
  const finalAddress = vaultMap[selectedAsset] || vaultMap.USDT;

  res.json({
    success: true,
    address: finalAddress,
    asset: selectedAsset,
    // Add logic here if you ever need specific MEMO IDs for coins like XRP/XLM
    memo: null 
  });
});

/**
 * @desc    Get User Profile
 * @route   GET /api/users/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }
  res.json({ success: true, user });
});

/**
 * @desc    Update User Profile
 * @route   PUT /api/users/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    res.json({ 
      success: true, 
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
