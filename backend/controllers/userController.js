// backend/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { deriveEthAddress } from '../utils/ethUtils.js';

/**
 * ===============================
 * USER STATS - DASHBOARD
 * ===============================
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User identity not found' 
    });
  }

  // balances is a plain object in your schema
  const balances = user.balances || {};

  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.status(200).json({
    success: true,
    principal: Number(balances.INVESTED || 0),
    availableBalance: Number(balances.EUR || 0),
    accruedROI: Number(balances.TOTAL_PROFIT || 0),
    btcBalance: Number(balances.BTC || 0),
    ethBalance: Number(balances.ETH || 0),

    balances,                    // raw balances for debugging
    transactions,

    activePlan: user.activePlan || 'None',
    kycStatus: user.kycStatus || 'unverified',
  });
});

/**
 * ===============================
 * LEDGER
 * ===============================
 */
export const getLedger = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({
    success: true,
    transactions
  });
});

/**
 * ===============================
 * DEPOSIT ADDRESS
 * ===============================
 */
export const getDepositAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const allowedAssets = ['BTC', 'ETH', 'USDT'];
  const asset = (req.query.asset || 'BTC').toUpperCase();

  if (!allowedAssets.includes(asset)) {
    return res.status(400).json({ success: false, message: 'Unsupported asset type' });
  }

  let address = user.walletAddresses?.[asset];

  if (!address) {
    if (user.address_index === undefined) {
      return res.status(500).json({ success: false, message: 'Address index missing' });
    }

    if (asset === 'BTC') {
      address = deriveBtcAddress(user.address_index).address;
    } else {
      address = deriveEthAddress(user.address_index).address;
    }

    // Initialize walletAddresses if it doesn't exist
    user.walletAddresses = user.walletAddresses || {};
    user.walletAddresses[asset] = address;

    if (asset !== 'BTC') {
      user.walletAddresses.ETH = address;
      user.walletAddresses.USDT = address;
    }

    await user.save();
  }

  res.status(200).json({
    success: true,
    address,
    asset,
  });
});

/**
 * ===============================
 * COMPOUND YIELD
 * ===============================
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const balances = user.balances || {};
  const profit = Number(balances.TOTAL_PROFIT || 0);

  if (profit < 10) {
    return res.status(400).json({ success: false, message: 'Minimum €10 required' });
  }

  const invested = Number(balances.INVESTED || 0);

  // Update balances
  user.balances = user.balances || {};
  user.balances.TOTAL_PROFIT = 0;
  user.balances.INVESTED = invested + profit;

  await user.save();

  await Transaction.create({
    user: user._id,
    type: 'yield',
    amount: profit,
    currency: 'EUR',
    status: 'completed',
    description: 'Compounded profit'
  });

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: user.balances,
      message: `+€${profit.toFixed(2)} compounded`
    });
  }

  res.json({ success: true });
});

/**
 * ===============================
 * WITHDRAWAL
 * ===============================
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, address } = req.body;

  const user = await User.findById(req.user._id);
  const balances = user.balances || {};
  const currentBalance = Number(balances.EUR || 0);

  if (amount < 50) {
    return res.status(400).json({ success: false, message: 'Minimum €50' });
  }

  if (currentBalance < amount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }

  // Update balance
  user.balances = user.balances || {};
  user.balances.EUR = currentBalance - amount;

  await user.save();

  const tx = await Transaction.create({
    user: user._id,
    type: 'withdrawal',
    amount,
    currency: 'EUR',
    walletAddress: address,
    status: 'pending'
  });

  res.status(201).json({ success: true, transaction: tx });
});

/**
 * ===============================
 * PROFILE
 * ===============================
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({ success: true, user });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name = req.body.name || user.name;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();

  res.status(200).json({ success: true, user });
});

/**
 * ===============================
 * SEED GERY BALANCES
 * Available: €85,000 | Profit: €15,550 | Principal: €25,000
 * Total: €125,550
 * POST /api/users/seed-gery
 * ===============================
 */
export const seedGeryBalances = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // Set balances as plain object to match your schema
  user.balances = {
    EUR: 85000,           // Available Balance
    INVESTED: 25000,      // Principal
    TOTAL_PROFIT: 15550,  // Accrued Profit
    BTC: 0.45,
    ETH: 2.15,
    USDT: 5000,
  };

  await user.save();

  res.json({
    success: true,
    message: '✅ Gery balances seeded successfully! Total Capital = €125,550',
    totalCapital: 125550,
    breakdown: {
      availableEUR: 85000,
      principal: 25000,
      accruedProfit: 15550,
      total: 125550
    },
    rawBalances: user.balances
  });
});
