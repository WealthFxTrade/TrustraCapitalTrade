import User from '../models/User.js';

export async function creditUser({
  userId,
  amount,
  currency,
  source,
  referenceId,
  description,
  session,
}) {
  if (!userId || !amount || !currency) throw new Error('Missing required parameters');

  const user = await User.findById(userId).session(session);
  if (!user) throw new Error('User not found');

  user.balances = user.balances || {};
  user.ledger = user.ledger || [];

  if (!user.balances[currency]) user.balances[currency] = 0;
  user.balances[currency] += amount;

  user.ledger.push({
    amount,
    currency,
    type: 'credit',
    source,
    referenceId,
    description,
    createdAt: new Date(),
  });

  await user.save({ session });
}
