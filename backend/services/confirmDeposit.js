import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

/**
 * Verifies on-chain confirmations and credits the user's EUR Node.
 * Standardized for the Trustra Capital Trade (2026) Infrastructure.
 */
export const confirmDeposit = async (depositId) => {
  try {
    const deposit = await Deposit.findById(depositId);
    
    // 1. Validation: Prevent double-processing or invalid IDs
    if (!deposit || deposit.status === 'confirmed') {
      return { success: false, message: 'Deposit already finalized or not found' };
    }

    // 2. Network Verification: Ensure 3+ confirmations for BTC security
    const confirmations = await getBtcTxConfirmations(deposit.txid);
    console.log(`[Node_Sync] ID: ${depositId} | Confirmations: ${confirmations}/3`);

    if (confirmations >= 3) {
      // 3. Finalize Deposit Status
      deposit.status = 'completed';
      deposit.confirmedAt = new Date();
      await deposit.save();

      const user = await User.findById(deposit.user);
      if (!user) throw new Error('Deployment User Node not found');

      // 4. Update EUR Balance (Map-based logic)
      const currentEUR = user.balances.get('EUR') || 0;
      user.balances.set('EUR', currentEUR + deposit.amount);

      // 5. Append to Ledger for Transparency
      user.ledger.push({
        amount: deposit.amount,
        currency: 'EUR',
        type: 'deposit',
        status: 'completed',
        description: `Secured Node Deposit: ${deposit.txid.slice(0, 12)}...`,
        createdAt: new Date()
      });

      // 6. Persist Changes to Database
      user.markModified('balances');
      user.markModified('ledger');
      await user.save();

      console.log(`✅ [Rio_Standard] Deposit ${depositId} finalized for ${user.email}`);
      return { success: true, newBalance: user.balances.get('EUR') };
    }

    return { success: false, confirmations, message: 'Awaiting network depth' };

  } catch (error) {
    console.error("❌ [Confirm_Deposit_Fatal]:", error.message);
    throw error;
  }
};

