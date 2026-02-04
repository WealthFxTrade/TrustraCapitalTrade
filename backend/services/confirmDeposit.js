import mongoose from 'mongoose';
import Deposit from '../models/Deposit.js';
import { creditUser } from './ledgerService.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

const CONFIRMATIONS_REQUIRED = 3;

/**
 * Confirm a deposit by ID and credit user's balance
 * @param {string} depositId
 */
export async function confirmDeposit(depositId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deposit = await Deposit.findById(depositId).session(session);
    if (!deposit) throw new Error(`Deposit not found: ${depositId}`);

    // Already confirmed
    if (deposit.status === 'confirmed') {
      await session.commitTransaction();
      return;
    }

    // Fetch blockchain confirmations
    const confirmations = await getBtcTxConfirmations(deposit.txHash);
    if (confirmations == null) {
      deposit.status = 'pending';
      await deposit.save({ session });
      await session.commitTransaction();
      return;
    }

    deposit.confirmations = confirmations;

    if (confirmations < CONFIRMATIONS_REQUIRED) {
      deposit.status = 'confirming';
      await deposit.save({ session });
      await session.commitTransaction();
      return;
    }

    // Enough confirmations
    deposit.status = 'confirmed';
    await deposit.save({ session });

    // Credit user
    await creditUser({
      userId: deposit.user,
      amount: deposit.amountSat,
      currency: deposit.currency || 'BTC',
      source: 'deposit',
      referenceId: deposit._id.toString(),
      description: 'Deposit confirmed on-chain',
      session,
    });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(`[confirmDeposit ERROR] Deposit ID: ${depositId}`, err);
    throw err;
  } finally {
    session.endSession();
  }
}
