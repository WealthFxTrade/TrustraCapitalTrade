import mongoose from 'mongoose';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';

/**
 * Confirms a deposit and credits user balance atomically.
 * Uses Satoshis (integers) to avoid floating point errors.
 */
export const confirmDeposit = async (depositId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 1. Atomic status update (prevents double-crediting)
    const deposit = await Deposit.findOneAndUpdate(
      { _id: depositId, status: 'pending' },
      { $set: { status: 'confirmed', confirmedAt: new Date() } },
      { session, new: true }
    );

    if (!deposit) throw new Error('Deposit already processed or not found');

    // 2. Update User Balance & Ledger
    // Balances stored as integers (e.g. 1 BTC = 100,000,000 Satoshis)
    await User.updateOne(
      { _id: deposit.user },
      { 
        $inc: { [`balances.${deposit.currency}`]: deposit.amount },
        $push: { ledger: {
          amount: deposit.amount,
          currency: deposit.currency,
          type: 'credit',
          source: 'deposit',
          referenceId: deposit._id,
          status: 'completed'
        }}
      },
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

