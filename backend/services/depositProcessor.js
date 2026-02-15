import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * 💰 PROCESS DEPOSIT
 * Atomically credits a user's account and updates the ledger.
 */
export async function processBtcDeposit(userId, amount, txid, session = null) {
  try {
    // 1. Fetch user (excluding system counter)
    // We use the provided session to ensure this is part of the atomic transaction
    const user = await User.findOne({ 
      _id: userId, 
      isCounter: { $ne: true } 
    }).session(session);

    if (!user) throw new Error('User not found in Trustra database');

    // 2. Prevent Duplicate Processing
    // Check user's ledger for this specific TXID to avoid double-crediting
    const alreadyProcessed = user.ledger.some(entry => entry.description.includes(txid));
    if (alreadyProcessed) {
      console.log(`⚠️ TXID ${txid} already processed for user ${userId}`);
      return { success: false, message: 'Transaction already credited' };
    }

    // 3. Update Balance (Handling Mongoose Map)
    // You MUST use .get() and .set() for Mongoose Maps to trigger change tracking
    const currentBtcBalance = user.balances.get('BTC') || 0;
    const newBtcBalance = currentBtcBalance + amount;
    user.balances.set('BTC', newBtcBalance);

    // 4. Create Ledger Entry
    user.ledger.push({
      amount: amount,
      currency: 'BTC',
      type: 'deposit',
      status: 'completed',
      description: `Bitcoin Deposit Confirmed | TXID: ${txid}`,
      createdAt: new Date()
    });

    // 5. Save User (with session if provided)
    // This triggers the pre-save hooks in User.js (e.g., ROI Engine sync)
    await user.save({ session });

    // 6. Real-time Notification
    // Access the Socket.io instance attached to the app
    const io = user.constructor.model('User').db.base.models.User.socketio;
    if (io) {
      io.to(userId.toString()).emit('balance_update', {
        currency: 'BTC',
        newBalance: newBtcBalance,
        message: `Successfully credited ${amount} BTC`
      });
    }

    console.log(`✅ Credited ${amount} BTC to User ${userId} [TX: ${txid}]`);
    return { success: true, newBalance: newBtcBalance };

  } catch (err) {
    console.error(`[DEPOSIT_PROCESSOR_ERROR] ${txid}:`, err.message);
    throw new ApiError(500, 'Failed to credit user deposit');
  }
}

