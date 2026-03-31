// utils/doubleEntry.js
import LedgerEntry from '../models/LedgerEntry.js';
import User from '../models/User.js';

/**
 * Create a double-entry ledger transaction
 * @param {Object} params
 * @param {ObjectId} params.userId - User initiating transaction
 * @param {Number} params.amount - Positive value
 * @param {String} params.currency - 'EUR', 'BTC', 'ETH'
 * @param {String} params.source - 'deposit', 'withdrawal', 'trade', 'admin_adjustment'
 * @param {String} params.debitAccount - Account debited
 * @param {String} params.creditAccount - Account credited
 * @param {String} params.description - Description of transaction
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
    throw new Error('Missing required parameters for ledger entry');
  }

  const debitEntry = new LedgerEntry({
    user: userId,
    type: 'debit',
    source,
    currency,
    amount,
    description: `[DEBIT] ${description || ''} → ${debitAccount}`,
    createdBy: userId,
  });

  const creditEntry = new LedgerEntry({
    user: userId,
    type: 'credit',
    source,
    currency,
    amount,
    description: `[CREDIT] ${description || ''} ← ${creditAccount}`,
    createdBy: userId,
  });

  await debitEntry.save();
  await creditEntry.save();
};
