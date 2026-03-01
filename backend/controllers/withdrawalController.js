import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Fetch global activity logs for Admin Live Pulse
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = async (req, res) => {
  try {
    // Fetches the 15 most recent transactions across the platform
    const logs = await Transaction.find()
      .populate('user', 'fullName email') 
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: "Activity Feed Offline" });
  }
};

/**
 * @desc    Request a withdrawal (User)
 */
export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { amount, currency = 'EUR', address } = req.body;

    if (!amount || amount <= 0) throw new Error('Invalid withdrawal amount');

    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new Error('User not found');

    // Check balance (ensure field name matches your User model, e.g., balances.total or balances.EUR_PROFIT)
    const currentBalance = user.balances.total || 0; 

    if (currentBalance < amount) throw new Error('Insufficient balance for extraction');

    // 1️⃣ Create Transaction
    const [transaction] = await Transaction.create([{
      user: user._id,
      type: 'withdrawal',
      amount,
      signedAmount: -amount,
      currency,
      walletAddress: address,
      status: 'pending',
      description: `Extraction to ${address}`,
      method: 'crypto'
    }], { session });

    // 2️⃣ Deduct Balance & Update Ledger
    user.balances.total -= amount;
    user.transactionHistory.push(transaction._id); // Assuming you track IDs in User model

    await user.save({ session });
    await session.commitTransaction();

    res.status(201).json({ success: true, message: 'Extraction protocol initiated' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get all withdrawals (Admin only)
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update withdrawal status (Admin only)
 */
export const updateWithdrawalStatus = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { status } = req.body; // 'completed', 'rejected', 'failed'

    const transaction = await Transaction.findById(req.params.id).session(session);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'pending') throw new Error('Transaction already processed');

    transaction.status = status;
    await transaction.save({ session });

    // If rejected, refund the user
    if (status === 'rejected' || status === 'failed') {
      await User.findByIdAndUpdate(transaction.user, {
        $inc: { 'balances.total': transaction.amount }
      }).session(session);
    }

    await session.commitTransaction();
    res.json({ success: true, message: `Node Status Updated: ${status}` });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Ensure this is at the end to match your existing pattern
export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ user: req.user.id, type: 'withdrawal' }).sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
