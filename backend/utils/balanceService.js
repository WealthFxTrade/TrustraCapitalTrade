// controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import { getCryptoPriceEUR } from '../utils/balanceService.js';

/**
 * Add admin ledger entry
 */
const addAdminLedgerEntry = async ({
  userId,
  type,
  source,
  currency,
  amount,
  eurValue,
  referenceId = null,
  description = '',
  createdBy,
}) => {
  return await LedgerEntry.create({
    user: userId,
    type,
    source,
    currency,
    amount,
    eurValue,
    referenceId,
    description,
    createdBy,
  });
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, data: users });
});

/**
 * @route   GET /api/admin/user/:id
 * @desc    Get user by ID
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new Error('User not found');
  res.status(200).json({ success: true, data: user });
});

/**
 * @route   GET /api/admin/ledger
 * @desc    Get full ledger of all users
 * @access  Admin
 */
export const getFullLedger = asyncHandler(async (req, res) => {
  const ledger = await LedgerEntry.find().populate('user', 'username email');
  res.status(200).json({ success: true, data: ledger });
});

/**
 * @route   POST /api/admin/ledger-adjustment
 * @desc    Add manual admin ledger adjustment
 * @access  Admin
 */
export const addLedgerAdjustment = asyncHandler(async (req, res) => {
  const { userId, type, currency, amount, description } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) throw new Error('Invalid amount');

  // Update user balance
  const currentBalance = user.balances.get(currency) || 0;
  const newBalance = type === 'credit' ? currentBalance + numericAmount : currentBalance - numericAmount;
  user.balances.set(currency, newBalance);
  user.markModified('balances');

  // Compute EUR value for BTC/ETH
  const eurValue =
    currency === 'EUR' ? numericAmount : numericAmount * (await getCryptoPriceEUR(currency));

  await addAdminLedgerEntry({
    userId: user._id,
    type,
    source: 'admin_adjustment',
    currency,
    amount: numericAmount,
    eurValue,
    description: description || 'Admin adjustment',
    createdBy: req.admin._id, // admin performing adjustment
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Ledger adjustment applied successfully',
    newBalance,
  });
});

/**
 * @route   GET /api/admin/deposits
 * @desc    List all deposits
 * @access  Admin
 */
export const getAllDeposits = asyncHandler(async (req, res) => {
  const deposits = await Deposit.find().populate('user', 'username email');
  res.status(200).json({ success: true, data: deposits });
});

/**
 * @route   GET /api/admin/withdrawals
 * @desc    List all withdrawal requests
 * @access  Admin
 */
export const getAllWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find().populate('user', 'username email');
  res.status(200).json({ success: true, data: withdrawals });
});

/**
 * @route   POST /api/admin/withdrawals/:id/approve
 * @desc    Approve a withdrawal
 * @access  Admin
 */
export const approveWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw new Error('Withdrawal not found');

  if (withdrawal.status === 'completed') {
    throw new Error('Withdrawal already completed');
  }

  const user = await User.findById(withdrawal.user);
  if (!user) throw new Error('User not found');

  const currency = withdrawal.currency;
  const amount = withdrawal.amount;
  const currentBalance = user.balances.get(currency) || 0;

  if (currentBalance < amount) {
    throw new Error('Insufficient balance for withdrawal');
  }

  user.balances.set(currency, currentBalance - amount);
  user.markModified('balances');

  // Ledger entry
  const eurValue =
    currency === 'EUR' ? amount : amount * (await getCryptoPriceEUR(currency));

  await addAdminLedgerEntry({
    userId: user._id,
    type: 'debit',
    source: 'withdrawal',
    currency,
    amount,
    eurValue,
    referenceId: withdrawal._id,
    description: 'Approved withdrawal',
    createdBy: req.admin._id,
  });

  withdrawal.status = 'completed';
  await withdrawal.save();
  await user.save();

  res.status(200).json({ success: true, message: 'Withdrawal approved' });
});

/**
 * @route   POST /api/admin/withdrawals/:id/reject
 * @desc    Reject a withdrawal
 * @access  Admin
 */
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw new Error('Withdrawal not found');

  withdrawal.status = 'rejected';
  await withdrawal.save();

  res.status(200).json({ success: true, message: 'Withdrawal rejected' });
});
