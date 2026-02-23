import mongoose from 'mongoose';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

/**
 * 🛡️ Trustra Secure Node Finalizer
 * Verifies on-chain depth and credits the User Node atomically.
 */
export const confirmDeposit = async (depositId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch Deposit with Session Lock
    const deposit = await Deposit.findById(depositId).session(session);

    if (!deposit || deposit.status === 'completed') {
      await session.abortTransaction();
      return { success: false, message: 'Deposit already finalized or not found' };
    }

    // 2. Network Verification (3+ Confirmations for 2026 BTC Security)
    const confirmations = await getBtcTxConfirmations(deposit.txid);
    
    if (confirmations < 3) {
      await session.abortTransaction();
      return { success: false, confirmations, message: 'Awaiting network depth' };
    }

    // 3. Finalize Deposit Status
    deposit.status = 'completed';
    deposit.confirmations = confirmations;
    deposit.confirmedAt = new Date();
    await deposit.save({ session });

    // 4. Fetch User Node
    const user = await User.findById(deposit.user).session(session);
    if (!user) throw new Error('Target User Node not found in Trustra Cluster');

    /**
     * 5. Update Balance (Mongoose Map Logic)
     * Note: Ensure 'deposit.currency' (BTC/EUR) matches the Map Key.
     */
    const currencyKey = deposit.currency || 'BTC'; 
    const currentBalance = user.balances.get(currencyKey) || 0;
    const newBalance = currentBalance + deposit.amount;
    
    user.balances.set(currencyKey, newBalance);

    // 6. Append to Ledger for Transparency
    user.ledger.push({
      amount: deposit.amount,
      currency: currencyKey,
      type: 'deposit',
      status: 'completed',
      description: `Secured ${currencyKey} Deposit: ${deposit.txid.slice(0, 12)}...`,
      createdAt: new Date()
    });

    /**
     * 7. Persist Changes Atomically
     * Calling .save() on the user triggers the pre-save hooks in User.js
     * which automatically syncs the ROI Engine and Admin roles.
     */
    await user.save({ session });

    // 8. Commit Transaction (All or Nothing)
    await session.commitTransaction();
    
    console.log(`✅ [Trustra_Finalized] ${currencyKey} Deposit ${depositId} for ${user.email}`);
    return { success: true, newBalance: user.balances.get(currencyKey) };

  } catch (error) {
    // 9. Rollback on Failure
    await session.abortTransaction();
    console.error("❌ [Confirm_Deposit_Fatal]:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
};

