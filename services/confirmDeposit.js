// backend/services/confirmDeposit.js
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';          // ← changed to existing model
import { creditUser } from './ledgerService.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

const CONFIRMATIONS_REQUIRED = 3;

/**
 * Confirm a deposit transaction by ID and credit user's balance
 * Uses transaction session for atomicity
 * @param {string} transactionId - ID of the Transaction document
 */
export async function confirmDeposit(transactionId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the transaction (must be a deposit)
    const transaction = await Transaction.findOne({
      _id: transactionId,
      type: 'deposit'                               // safety check
    }).session(session);

    if (!transaction) {
      throw new Error(`Deposit transaction not found or not a deposit: ${transactionId}`);
    }

    // Already confirmed
    if (transaction.status === 'completed') {
      await session.commitTransaction();
      return;
    }

    // Fetch current blockchain confirmations
    const confirmations = await getBtcTxConfirmations(transaction.txHash);
    if (confirmations == null) {
      transaction.status = 'pending';
      await transaction.save({ session });
      await session.commitTransaction();
      return;
    }

    transaction.confirmations = confirmations;

    if (confirmations < CONFIRMATIONS_REQUIRED) {
      transaction.status = 'confirming';
      await transaction.save({ session });
      await session.commitTransaction();
      return;
    }

    // Enough confirmations → finalize
    transaction.status = 'completed';
    await transaction.save({ session });

    // Credit the user's balance / ledger
    await creditUser({
      userId: transaction.user,
      amount: transaction.amount,               // use your field name (amount, not amountSat)
      currency: transaction.currency || 'BTC',
      source: 'deposit',
      referenceId: transaction._id.toString(),
      description: 'Deposit confirmed on-chain',
      session,
    });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(`[confirmDeposit ERROR] Transaction ID: ${transactionId}`, {
      message: err.message,
      stack: err.stack
    });
    throw err;
  } finally {
    session.endSession();
  }
}
