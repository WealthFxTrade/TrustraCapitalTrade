import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Request a withdrawal
 * @route   POST /api/withdrawals/request
 * @access  Private
 */
export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, currency = 'EUR', address } = req.body;

    if (!amount || amount <= 0) {
      throw new Error('Invalid withdrawal amount');
    }

    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new Error('User not found');

    const currentBalance = user.balances.EUR_PROFIT || 0;

    if (currentBalance < amount) {
      throw new Error('Insufficient profit balance');
    }

    // 1️⃣ Create Transaction record
    const [transaction] = await Transaction.create(
      [{
        user: user._id,
        type: 'withdrawal',
        amount,
        signedAmount: -amount,
        currency,
        walletAddress: address,
        status: 'pending',
        description: `Withdrawal request to ${address}`,
        method: 'crypto'
      }],
      { session }
    );

    // 2️⃣ Deduct user balance
    user.balances.EUR_PROFIT -= amount;

    // 3️⃣ Add to ledger
    user.ledger.push({
      amount,
      signedAmount: -amount,
      currency,
      type: 'withdrawal',
      status: 'pending',
      referenceId: transaction._id,
      description: `Withdrawal request to ${address}`
    });

    await user.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted and pending approval'
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};


/**
 * @desc    Get user's own withdrawals
 */
export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      user: req.user.id,
      type: 'withdrawal'
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @desc    Get all withdrawals (Admin only)
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal' })
      .populate('user', 'email')
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

    const { status } = req.body;

    const transaction = await Transaction.findById(req.params.id)
      .session(session);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new Error('Only pending withdrawals can be updated');
    }

    transaction.status = status;
    await transaction.save({ session });

    const user = await User.findById(transaction.user).session(session);

    // Refund if failed or rejected
    if (status === 'failed' || status === 'rejected') {
      user.balances.EUR_PROFIT += transaction.amount;
    }

    // Update ledger entry
    const ledgerItem = user.ledger.find(
      l => l.referenceId?.toString() === transaction._id.toString()
    );

    if (ledgerItem) {
      ledgerItem.status = status;
    }

    await user.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Withdrawal marked as ${status}`
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
