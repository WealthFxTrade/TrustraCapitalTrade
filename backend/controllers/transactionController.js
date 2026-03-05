import mongoose from 'mongoose';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Initialize Outbound Fund Extraction (Withdrawal)
 * @route   POST /api/transactions/withdraw
 */
export const initiateWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, destination, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    // Validation Protocols
    if (currency !== 'EUR') {
      throw new ApiError(400, 'Only EUR withdrawals supported in current node version');
    }

    if (!amount || amount < 80) {
      throw new ApiError(400, 'Minimum withdrawal threshold is €80.00');
    }

    if (!destination || typeof destination !== 'string' || destination.trim().length < 15) {
      throw new ApiError(400, 'Valid destination node (IBAN or Wallet) required');
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'Authorized user node not found');

    // Security Gate: KYC Status
    if (user.kycStatus !== 'verified') {
      throw new ApiError(403, 'Account Audit (KYC) required for extraction protocols');
    }

    const available = user.balances.get('EUR') || 0;
    if (available < amount) {
      throw new ApiError(400, `Insufficient liquidity (Available: €${available.toFixed(2)})`);
    }

    // ── 1. DEDUCT LIQUIDITY ──
    user.balances.set('EUR', available - amount);

    // ── 2. LOG INTERNAL LEDGER ──
    user.ledger.push({
      amount: -amount,
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Extraction to ${destination.slice(0, 10)}...`,
      createdAt: new Date(),
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    // ── 3. CREATE EXTERNAL WITHDRAWAL RECORD ──
    const [withdrawal] = await Withdrawal.create([{
      user: userId,
      amount,
      asset: 'EUR',
      address: destination.trim(),
      status: 'pending',
      netAmount: amount, // Potential for fee deduction logic here
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Extraction protocol initiated – pending compliance review',
      withdrawalId: withdrawal._id,
      newBalance: user.balances.get('EUR'),
    });
  } catch (error) {
    await session.abortTransaction();
    next(error instanceof ApiError ? error : new ApiError(500, 'Withdrawal sequence failed'));
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Internal Atomic Swap: ROI (Yield) -> EUR (Balance)
 * @route   POST /api/transactions/exchange
 */
export const exchangeProfitToBalance = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Invalid exchange volume requested');
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'User identity not found');

    const currentRoi = user.balances.get('ROI') || 0;
    const currentEur = user.balances.get('EUR') || 0;

    if (currentRoi < amount) {
      throw new ApiError(400, `Insufficient ROI liquidity (€${currentRoi.toFixed(2)})`);
    }

    // ── PROTOCOL FEE LOGIC (1.5%) ──
    const fee = amount * 0.015;
    const netAmount = amount - fee;

    // Update Internal Maps
    user.balances.set('ROI', currentRoi - amount);
    user.balances.set('EUR', currentEur + netAmount);

    // Record Ledger Entry
    user.ledger.push({
      amount: netAmount,
      currency: 'EUR',
      type: 'exchange',
      status: 'completed',
      description: `Internal Swap: Yield to Capital (System Fee: €${fee.toFixed(2)})`,
      createdAt: new Date(),
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Internal liquidity rebalanced successfully',
      newBalances: {
        EUR: user.balances.get('EUR'),
        ROI: user.balances.get('ROI')
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(error instanceof ApiError ? error : new ApiError(500, 'Exchange protocol failure'));
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Sync and Retrieve Deposit Infrastructure
 * @route   GET /api/transactions/deposit-address
 */
export const getDepositAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    // Retrieve from Map in User.js
    let btcAddr = user.depositAddresses.get('BTC');

    // Generate if not exists
    if (!btcAddr) {
      // Deterministic Address Generation logic (Simulated for this node)
      btcAddr = `bc1q${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      user.depositAddresses.set('BTC', btcAddr);
      user.btcAddress = btcAddr; // Sync to indexed field
      await user.save();
    }

    res.json({
      success: true,
      asset: 'BTC',
      address: btcAddr
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to provision deposit address'));
  }
};

/**
 * @desc    Fetch Complete Synchronization Ledger
 * @route   GET /api/transactions/ledger
 */
export const getMyTransactions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ledger');
    if (!user) throw new ApiError(404, 'User identity not recognized');

    res.json({
      success: true,
      ledger: [...user.ledger].sort((a, b) => b.createdAt - a.createdAt),
    });
  } catch (err) {
    next(err);
  }
};

export default { 
  initiateWithdrawal, 
  exchangeProfitToBalance, 
  getDepositAddress, 
  getMyTransactions 
};
