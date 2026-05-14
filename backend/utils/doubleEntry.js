// utils/doubleEntry.js
import mongoose from 'mongoose';
import LedgerEntry from '../models/LedgerEntry.js';
import User from '../models/User.js';

/**
 * Creates an immutable atomic double-entry ledger transaction using MongoDB sessions.
 * Guarantees mathematical equality between debits and credits across the ecosystem.
 * 
 * @param {Object} params
 * @param {mongoose.Types.ObjectId} params.userId - User initiating the transaction
 * @param {Number} params.amount - The absolute transactional value (must be positive)
 * @param {String} params.currency - Asset ticker (e.g., 'EUR', 'BTC', 'ETH', 'USDT')
 * @param {String} params.source - Transaction driver ('deposit', 'withdrawal', 'investment', 'yield')
 * @param {String} params.debitAccount - System account name being debited
 * @param {String} params.creditAccount - System account name being credited
 * @param {String} params.description - Functional audit trail summary
 */
export const createDoubleEntry = async ({
  userId,
  amount,
  currency,
  source,
  debitAccount,
  creditAccount,
  description,
}) => {
  if (!userId || !amount || !currency || !debitAccount || !creditAccount) {
    throw new Error('Missing required parameters for structural double-entry ledger instantiation.');
  }

  const cleanAmount = parseFloat(amount);
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    throw new Error('Ledger transaction amount must evaluate to a positive, finite numerical value.');
  }

  const asset = currency.toUpperCase();
  
  // PRODUCTION SECURITY FIX: Initialize an isolation-guaranteed database session transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Construct the debit ledger document inside the session tracking boundaries
    const debitEntry = new LedgerEntry({
      user: userId,
      type: 'debit',
      source,
      currency: asset,
      amount: cleanAmount,
      description: `[DEBIT] ${description || ''} → ${debitAccount}`,
      createdBy: userId,
    });

    // 2. Construct the matching companion credit ledger document inside the same session context
    const creditEntry = new LedgerEntry({
      user: userId,
      type: 'credit',
      source,
      currency: asset,
      amount: cleanAmount,
      description: `[CREDIT] ${description || ''} ← ${creditAccount}`,
      createdBy: userId,
    });

    // 3. Save both documents atomically. If either operation fails, the database rejects both.
    await debitEntry.save({ session });
    await creditEntry.save({ session });

    // 4. Commit the transaction block permanently to the storage cluster node
    await session.commitTransaction();
    console.log(`📊 [LEDGER] Balanced entry recorded successfully for user ${userId}. Amount: ${cleanAmount} ${asset}`);

  } catch (error) {
    // PRODUCTION SECURITY FIX: Roll back any partially written data to protect ledger integrity
    await session.abortTransaction();
    console.error('❌ [LEDGER FATAL ERROR] Double-entry reconciliation failed. Transaction aborted cleanly:', error.message);
    throw error;
  } finally {
    // End the active session block to release memory resources
    await session.endSession();
  }
};

