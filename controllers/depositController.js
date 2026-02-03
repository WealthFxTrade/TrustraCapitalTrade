// backend/controllers/depositController.js
import Deposit from '../models/Deposit.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { confirmDeposit } from '../services/confirmDeposit.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import mongoose from 'mongoose';

/**
 * @desc    Initializes a new deposit record AND ledger + transaction
 * @access  Private
 */
export async function createDeposit(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, method, currency, address, txHash } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) throw new ApiError(400, 'A valid positive amount is required');
    if (!address || !currency) throw new ApiError(400, 'Currency and destination address are required');

    // Prevent duplicate txHash
    if (txHash) {
      const existing = await Deposit.findOne({ txHash }).lean();
      if (existing) throw new ApiError(400, 'Transaction hash already submitted');
    }

    // Create deposit
    const deposit = await Deposit.create([{
      user: userId,
      currency: currency.toUpperCase(),
      address,
      amount,
      status: 'pending',
      txHash,
      method: method || 'crypto',
    }], { session });

    // Update user ledger & balances
    const user = await User.findById(userId).session(session);
    const prevBalance = user.balances.get(currency.toUpperCase()) || 0;

    // For deposits, we usually credit on confirmation, but we can log pending
    user.ledger.push({
      amount,
      signedAmount: amount,
      currency: currency.toUpperCase(),
      type: 'deposit',
      source: 'crypto',
      status: 'pending',
      referenceId: deposit[0]._id,
      description: 'Deposit initiated',
    });

    await user.save({ session });

    // Also create a Transaction record
    await Transaction.create([{
      user: userId,
      type: 'deposit',
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      referenceId: deposit[0]._id,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: 'Deposit recorded. Pending confirmation.',
      deposit: deposit[0],
      balances: user.balances,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

/**
 * @desc    Fetch deposit history for the authenticated user
 */
export async function getUserDeposits(req, res, next) {
  try {
    const deposits = await Deposit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, deposits });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Admin only: Fetch all deposits
 */
export async function getAllDeposits(req, res, next) {
  try {
    const deposits = await Deposit.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: deposits.length, deposits });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Admin only: Manually confirm deposit
 */
export async function manualConfirmDeposit(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { depositId } = req.params;

    const deposit = await Deposit.findById(depositId).session(session);
    if (!deposit) throw new ApiError(404, 'Deposit not found');

    if (deposit.status === 'completed') {
      throw new ApiError(400, 'Deposit already confirmed');
    }

    // Confirm deposit (service handles balance update atomically)
    await confirmDeposit(depositId, session);

    await session.commitTransaction();
    res.json({ success: true, message: 'Deposit confirmed and balance updated' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

/**
 * @desc    Get or derive a BTC SegWit deposit address
 */
export async function getOrCreateBtcDepositAddressController(req, res, next) {
  try {
    const userId = req.user._id;
    const fresh = req.query.fresh === 'true';

    const address = await getOrCreateBtcDepositAddress(userId, fresh);
    res.json({ success: true, address });
  } catch (err) {
    next(err);
  }
}

// Alias for /btc/history route
export const getDepositHistory = getUserDeposits;
