import mongoose from 'mongoose';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';

/**
 * Trustra Capital Trade - Transaction Controller
 * EUR Liquidation Only
 */

export const initiateWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, destination, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    if (currency !== 'EUR') {
      throw new Error('Unsupported liquidation currency');
    }

    if (!amount || amount < 80) {
      throw new Error('Minimum liquidation threshold is €80.00');
    }

    if (!destination || destination.length < 15) {
      throw new Error('Invalid payout destination');
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('Security Node: User not found');

    const availableBalance = user.balances.get('EUR') || 0;

    if (availableBalance < amount) {
      throw new Error(`Insufficient EUR balance (€${availableBalance})`);
    }

    // Deduct balance
    user.balances.set('EUR', availableBalance - amount);

    // Ledger entry
    user.ledger.push({
      amount: -amount,
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `EUR liquidation to ${destination.slice(0, 10)}...`,
      createdAt: new Date(),
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    // Withdrawal record (admin settlement queue)
    const [withdrawal] = await Withdrawal.create(
      [{
        user: userId,
        amount,
        asset: 'EUR',
        address: destination,
        status: 'pending',
        fee: 0,
        netAmount: amount,
      }],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Liquidation request queued for settlement',
      newBalance: user.balances.get('EUR'),
      withdrawalId: withdrawal._id,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('[LIQUIDATION_ERROR]', error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('ledger');

    res.json({
      success: true,
      ledger: [...user.ledger].reverse(), // non-mutating
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ledger',
    });
  }
};

export default {
  initiateWithdrawal,
  getMyTransactions,
};
