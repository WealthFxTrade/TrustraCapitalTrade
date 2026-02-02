import User from '../models/User.js';

/**
 * Atomic Credit Service for TrustraCapitalTrade
 * Handles balance updates and ledger entries within a transaction session.
 */
export async function creditUser({
  userId,
  amount,
  currency,
  source,
  referenceId,
  description,
  session,
}) {
  if (!userId || !amount || !currency) throw new Error('Missing required credit parameters');

  const user = await User.findById(userId).session(session);
  if (!user) throw new Error('User not found');

  // 1. Update Map Balance (Mongoose Maps require .get and .set)
  const currentBalance = user.balances.get(currency) || 0;
  user.balances.set(currency, currentBalance + amount);

  // 2. Prepare Ledger Entry (Matching your Ledger Schema)
  user.ledger.push({
    amount: Math.abs(amount),
    signedAmount: amount, // Positive for credit
    currency: currency.toUpperCase(),
    type: source, // e.g., 'deposit', 'profit', 'bonus'
    status: 'completed',
    referenceId,
    description: description || `System credit: ${source}`,
  });

  // 3. Save with session for atomicity
  await user.save({ session });
  
  console.log(`[Ledger] Successfully credited ${amount} ${currency} to ${user.email}`);
  return user;
}

