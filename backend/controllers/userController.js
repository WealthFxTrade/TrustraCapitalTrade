// backend/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { deriveEthAddress } from '../utils/ethUtils.js';

/**
 * @desc    Get dashboard metrics (Stats & Balances)
 * @route   GET /api/users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User identity not found' });
  }

  // Convert Mongoose Maps to plain JavaScript objects for frontend
  const balances = Object.fromEntries(user.balances || new Map());
  const walletAddresses = Object.fromEntries(user.walletAddresses || new Map());

  // Fetch 10 most recent transactions
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    // === SYNCED CORE FIELDS (Mapped for Frontend) ===
    principal: Number(balances.INVESTED || 0),
    availableBalance: Number(balances.EUR || 0),
    accruedROI: Number(balances.TOTAL_PROFIT || 0), // ROI mapping
    btcBalance: Number(balances.BTC || 0),
    ethBalance: Number(balances.ETH || 0),
    
    // Full objects for flexibility
    balances,
    walletAddresses,
    transactions,

    activePlan: user.activePlan || 'None',
    kycStatus: user.kycStatus || 'unverified',
    btcAddress: user.walletAddresses?.get('BTC') || null,
  });
});

/**
 * @desc    Get Full Transaction Ledger
 * @route   GET /api/users/transactions
 */
export const getLedger = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    transactions
  });
});

/**
 * @desc    Get Institutional Deposit Address
 * @route   GET /api/users/deposit-address?asset=BTC|ETH|USDT
 */
export const getDepositAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const allowedAssets = ['BTC', 'ETH', 'USDT'];
  const selectedAsset = (req.query.asset || 'BTC').toUpperCase();

  if (!allowedAssets.includes(selectedAsset)) {
    return res.status(400).json({ success: false, message: 'Unsupported asset type' });
  }

  let address = user.walletAddresses.get(selectedAsset);

  // Provision address only if missing
  if (!address || address === '') {
    try {
      if (user.address_index === undefined) throw new Error('No derivation index');

      if (selectedAsset === 'BTC') {
        const derived = deriveBtcAddress(user.address_index);
        address = derived.address;
      } else {
        const derived = deriveEthAddress(user.address_index);
        address = derived.address;
      }

      user.walletAddresses.set(selectedAsset, address);
      // EVM compatibility sync
      if (['ETH', 'USDT'].includes(selectedAsset)) {
        user.walletAddresses.set('ETH', address);
        user.walletAddresses.set('USDT', address);
      }

      user.markModified('walletAddresses');
      await user.save();
    } catch (err) {
      console.error('[ADDRESS PROVISION ERROR]', err.message);
      return res.status(500).json({ success: false, message: 'Provisioning failed' });
    }
  }

  return res.status(200).json({
    success: true,
    address,
    asset: selectedAsset,
    network: selectedAsset === 'BTC' ? 'Bitcoin (Native)' : 'Ethereum (ERC-20)'
  });
});

/**
 * @desc    Compound Accrued ROI into Principal
 * @route   POST /api/users/compound
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const accruedROI = Number(user.balances.get('TOTAL_PROFIT') || 0);

  if (accruedROI < 10) {
    return res.status(400).json({ 
      success: false, 
      message: 'Minimum compounding amount is €10.00' 
    });
  }

  // Atomic Update: TOTAL_PROFIT -> INVESTED
  user.balances.set('TOTAL_PROFIT', 0);
  const currentInvested = Number(user.balances.get('INVESTED') || 0);
  user.balances.set('INVESTED', currentInvested + accruedROI);
  
  user.markModified('balances');
  await user.save();

  await Transaction.create({
    user: user._id,
    type: 'yield',
    amount: accruedROI,
    currency: 'EUR',
    status: 'completed',
    description: `Compound: €${accruedROI.toFixed(2)} moved to principal`
  });

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      message: `✨ Compounding Complete: +€${accruedROI.toFixed(2)}`
    });
  }

  res.status(200).json({ success: true, message: 'ROI successfully compounded' });
});

/**
 * @desc    Process Withdrawal Request
 * @route   POST /api/users/withdraw
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, address, asset, walletType } = req.body;
  const user = await User.findById(req.user._id);

  const sourceKey = walletType === 'ROI' ? 'TOTAL_PROFIT' : 'EUR';
  const currentBalance = Number(user.balances.get(sourceKey) || 0);
  const withdrawAmount = Number(amount);

  if (withdrawAmount < 50) {
    return res.status(400).json({ success: false, message: 'Minimum €50.00' });
  }
  if (currentBalance < withdrawAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient funds' });
  }

  const tx = await Transaction.create({
    user: user._id,
    type: 'withdrawal',
    amount: withdrawAmount,
    currency: 'EUR',
    walletAddress: address,
    status: 'pending',
    description: `Liquidation to ${asset}`
  });

  user.balances.set(sourceKey, currentBalance - withdrawAmount);
  await user.save();

  res.status(201).json({ success: true, message: 'Withdrawal queued for audit', transaction: tx });
});

/**
 * @desc    Get Current User Profile
 * @route   GET /api/users/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({ success: true, user });
});

/**
 * @desc    Update User Profile
 * @route   PUT /api/users/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    if (req.body.password) user.password = req.body.password;
    if (req.body.avatar) user.avatar = req.body.avatar;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email }
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

