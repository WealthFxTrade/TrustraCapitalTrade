import mongoose from 'mongoose';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';

/**
 * Trustra Capital Trade - Withdrawal Controller (Rio Series 2026)
 * Handles secure fund deduction and admin review queuing.
 */

// @desc    Request a new withdrawal
// @route   POST /api/withdrawals
// @access  Private
export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { amount, asset, address } = req.body;
    const userId = req.user._id;

    // 1. Validation
    if (!amount || amount <= 0) throw new Error('Invalid withdrawal amount');
    if (!['BTC', 'ETH', 'USDT'].includes(asset)) throw new Error('Unsupported asset');

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User Node not found');

    const currentBalance = user.balances.get(asset) || 0;

    // 2. Anti-Fraud: Check for sufficient funds
    if (currentBalance < amount) {
      throw new Error(`Insufficient ${asset} balance. Required: ${amount}, Available: ${currentBalance}`);
    }

    // 3. Atomic Deduction: Subtract from balance immediately
    user.balances.set(asset, currentBalance - amount);
    
    // 4. Update Ledger: Mark as pending withdrawal
    user.ledger.push({
      amount: -amount, // Negative to show deduction
      currency: asset,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to ${address.slice(0, 8)}...`,
      createdAt: new Date()
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    // 5. Create Withdrawal Record
    const withdrawal = await Withdrawal.create([{
      user: userId,
      asset,
      address,
      amount,
      status: 'pending',
      fee: 0 // Logic for fees can be added here
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request transmitted to Security Node',
      withdrawal: withdrawal[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error(`[WITHDRAWAL_ERROR]: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get user withdrawal history
// @route   GET /api/withdrawals/my
// @access  Private
export const getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve history' });
  }
};

// @desc    Admin: Approve or Reject Withdrawal
// @route   PATCH /api/withdrawals/:id/status (Admin Only)
export const adminUpdateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote, txHash } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Record not found' });
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    if (status === 'rejected') {
      // Revert funds to user balance
      const user = await User.findById(withdrawal.user);
      const current = user.balances.get(withdrawal.asset) || 0;
      user.balances.set(withdrawal.asset, current + withdrawal.amount);
      
      user.ledger.push({
        amount: withdrawal.amount,
        currency: withdrawal.asset,
        type: 'deposit', // Re-crediting as a deposit type
        status: 'completed',
        description: `Refund: Rejected Withdrawal #${id.slice(-6)}`
      });

      user.markModified('balances');
      await user.save();
    }

    withdrawal.status = status;
    withdrawal.adminNote = adminNote;
    withdrawal.txHash = txHash;
    await withdrawal.save();

    res.json({ success: true, message: `Withdrawal ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

