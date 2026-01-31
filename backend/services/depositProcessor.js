import mongoose from 'mongoose';
import Deposit from '../models/Deposit.js';
import { creditUser } from './ledgerService.js';

const CONFIRMATIONS_REQUIRED = 3;

/**
 * Confirm a BTC deposit and credit the user atomically.
 * @param {string} depositId - ID of the deposit to confirm
 */
export async function confirmDeposit(depositId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(depositId).session(session);

    if (!deposit) throw new Error('Deposit not found');

    // Already confirmed, nothing to do
    if (deposit.status === 'confirmed') {
      await session.commitTransaction();
      return;
    }

    // Not enough confirmations yet
    if (deposit.confirmations < CONFIRMATIONS_REQUIRED) {
      deposit.status = 'confirming';
      await deposit.save({ session });
      await session.commitTransaction();
      return;
    }

    // Enough confirmations — mark confirmed and credit user
    deposit.status = 'confirmed';
    await deposit.save({ session });

    await creditUser({
      userId: deposit.user,
      amount: deposit.amountSat, // satoshis
      currency: 'BTC',
      source: 'deposit',
      referenceId: deposit._id,
      description: 'BTC deposit confirmed',
      session, // ensures atomicity
    });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error('Error confirming deposit:', err);
    throw err;
  } finally {
    session.endSession();
  }
}
