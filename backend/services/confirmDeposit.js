import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

/**
 * Verifies transaction on-chain and updates user balance
 */
export const confirmDeposit = async (depositId) => {
  try {
    const deposit = await Deposit.findById(depositId);
    if (!deposit || deposit.status === 'confirmed') return { success: false };

    // Check on-chain confirmations
    const confirmations = await getBtcTxConfirmations(deposit.txid);
    console.log(`[Service] Deposit ${depositId} confirmations: ${confirmations}`);

    if (confirmations >= 3) {
      deposit.status = 'confirmed';
      await deposit.save();

      const user = await User.findById(deposit.user);
      if (!user) throw new Error('User not found');

      // Update EUR balance (Rio Series 2026 standardized logic)
      const currentEUR = user.balances.get('EUR') || 0;
      user.balances.set('EUR', currentEUR + deposit.amount);
      
      user.markModified('balances');
      await user.save();

      console.log(`✅ [Service] Deposit ${depositId} finalized for ${user.email}`);
      return { success: true };
    }
    return { success: false, confirmations };
  } catch (error) {
    console.error("[Service Error]:", error.message);
    throw error;
  }
};

