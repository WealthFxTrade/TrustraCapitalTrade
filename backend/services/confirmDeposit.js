import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

/**
 * Main service to verify and finalize deposits
 */
export const confirmDeposit = async (depositId) => {
  try {
    const deposit = await Deposit.findById(depositId);
    if (!deposit || deposit.status === 'confirmed') return { status: 'already_processed' };

    // Use the txid stored in the deposit document
    const confirmations = await getBtcTxConfirmations(deposit.txid);
    console.log(`Deposit ${depositId} has ${confirmations} confirmations.`);

    if (confirmations >= 3) {
      deposit.status = 'confirmed';
      await deposit.save();

      const user = await User.findById(deposit.user);
      if (!user) throw new Error('User associated with deposit not found');

      // Update EUR balance (Rio Series 2026 Logic)
      const currentBalance = user.balances.get('EUR') || 0;
      user.balances.set('EUR', currentBalance + deposit.amount);
      
      user.markModified('balances');
      await user.save();

      console.log(`✅ Deposit ${depositId} confirmed. EUR balance updated for ${user.email}`);
      return { status: 'confirmed' };
    }

    return { status: 'pending', confirmations };
  } catch (err) {
    console.error('confirmDeposit Service Error:', err.message);
    throw err;
  }
};

