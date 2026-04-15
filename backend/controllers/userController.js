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

  // Convert Mongoose Maps to standard Objects for frontend consumption
  const balances = Object.fromEntries(user.balances);
  const walletAddresses = Object.fromEntries(user.walletAddresses);

  // Fetch 10 most recent transactions
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    stats: {
      balances,
      walletAddresses,
      transactions,
      activePlan: user.activePlan || 'Sovereign',
      kycStatus: user.kycStatus || 'verified',
      totalBalance: balances.EUR || 0,
      accruedROI: balances.ROI || 0,
      btcAddress: user.btcAddress // Provided by virtual getter in User.js
    }
  });
});

/**
 * @desc    Get Full Transaction Ledger
 * @route   GET /api/users/ledger
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
 * @desc    Get Institutional Deposit Address (Unique to User)
 * @route   GET /api/users/deposit-address
 */
export const getDepositAddress = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const allowedAssets = ['BTC', 'ETH', 'USDT'];
  const selectedAsset = (req.query.asset || 'BTC').toUpperCase();

  if (!allowedAssets.includes(selectedAsset)) {
    return res.status(400).json({ success: false, message: 'Unsupported asset type' });
  }

  // ── FIX: Access walletAddresses Map (String) NOT balances (Number) ──
  let address = user.walletAddresses.get(selectedAsset);

  // ── PROVISION ONLY IF MISSING OR EMPTY ──
  if (!address || address === '') {
    console.log(`📡 Generating unique ${selectedAsset} vault for ${user.email}`);

    try {
      if (user.address_index === undefined) {
        throw new Error('User has no assigned wallet index for HD derivation');
      }

      if (selectedAsset === 'BTC') {
        const derived = deriveBtcAddress(user.address_index);
        address = derived.address;
      } else {
        // ETH and USDT share the same EVM derivation path
        const derived = deriveEthAddress(user.address_index);
        address = derived.address;
      }

      // ── FIX: Save to walletAddresses Map to avoid Cast to Number error ──
      user.walletAddresses.set(selectedAsset, address);

      // Sync ETH and USDT maps automatically
      if (selectedAsset === 'ETH') user.walletAddresses.set('USDT', address);
      if (selectedAsset === 'USDT') user.walletAddresses.set('ETH', address);

      user.markModified('walletAddresses');
      await user.save();

      console.log(`✅ ${selectedAsset} vault provisioned: ${address}`);
    } catch (err) {
      console.error('[ADDRESS PROVISION ERROR]', err.message);
      return res.status(500).json({ 
        success: false, 
        message: `Provisioning failed: ${err.message}` 
      });
    }
  }

  return res.status(200).json({
    success: true,
    address,
    asset: selectedAsset,
    network: selectedAsset === 'BTC' ? 'Bitcoin' : 'Ethereum (ERC-20)',
    deterministic: true
  });
});

/**
 * @desc    Process Withdrawal Request
 * @route   POST /api/users/withdraw
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, address, asset, walletType } = req.body;
  const user = await User.findById(req.user._id);

  const sourceWallet = walletType === 'ROI' ? 'ROI' : 'EUR';
  const currentBalance = Number(user.balances.get(sourceWallet) || 0);
  const withdrawalAmount = Number(amount);

  if (isNaN(withdrawalAmount) || withdrawalAmount < 50) {
    return res.status(400).json({ success: false, message: 'Minimum withdrawal is €50.00' });
  }

  if (currentBalance < withdrawalAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient vault funds' });
  }

  const tx = await Transaction.create({
    user: user._id,
    type: 'withdrawal',
    amount: withdrawalAmount,
    currency: 'EUR',
    walletAddress: address,
    status: 'pending',
    description: `Liquidation to ${asset}`,
    method: asset === 'SEPA' ? 'bank' : 'crypto'
  });

  // Deduct from balance
  user.balances.set(sourceWallet, currentBalance - withdrawalAmount);
  await user.save();

  res.status(201).json({ 
    success: true, 
    message: 'Withdrawal queued for audit', 
    transaction: tx 
  });
});

/**
 * @desc    Strategic Yield Reinvestment (Compound)
 * @route   POST /api/users/compound
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const currentROI = Number(user.balances.get('ROI') || 0);

  if (currentROI < 10) {
    return res.status(400).json({ success: false, message: 'Minimum €10.00 required for compounding.' });
  }

  const currentEUR = Number(user.balances.get('EUR') || 0);
  
  // Move ROI to Principal
  user.balances.set('EUR', currentEUR + currentROI);
  user.balances.set('ROI', 0);
  await user.save();

  await Transaction.create({
    user: user._id,
    type: 'compound',
    amount: currentROI,
    currency: 'EUR',
    status: 'completed',
    description: 'Yield Maturity: ROI compounded to Principal',
    method: 'internal'
  });

  res.status(200).json({ success: true, message: 'ROI compounded successfully' });
});

/**
 * @desc    Get User Profile
 * @route   GET /api/users/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }
  res.json({ success: true, user });
});

/**
 * @desc    Update User Profile
 * @route   PUT /api/users/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Identity not found' });
  }

  user.name = req.body.name || user.name;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.status(200).json({ success: true, user: updatedUser });
});

