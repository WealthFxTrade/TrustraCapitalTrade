import mongoose from 'mongoose';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';

/**
 * Request a withdrawal (user-side)
 */
export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, asset, address, walletType } = req.body;
    const userId = req.user._id;

    // 1️⃣ Validation
    if (!amount || Number(amount) < 50) throw new Error('Minimum withdrawal is €50.00');
    // Ensure the asset is valid for your gateway
    if (!['BTC', 'ETH', 'USDT', 'EUR'].includes(asset)) throw new Error('Unsupported asset gateway');
    if (!address || address.length < 20) throw new Error('Invalid destination address');

    // 2️⃣ Fetch user with session
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    // 3️⃣ Determine wallet balance
    const balanceKey = walletType === 'profit' ? 'EUR_PROFIT' : 'EUR';
    const currentBalance = user.balances.get(balanceKey) || 0;

    if (currentBalance < Number(amount)) {
      throw new Error(`Insufficient funds in ${walletType} wallet. Available: €${currentBalance.toLocaleString()}`);
    }

    // 4️⃣ Deduct balance atomically (Escrow hold)
    user.balances.set(balanceKey, currentBalance - Number(amount));

    // 5️⃣ Append to ledger
    user.ledger.push({
      amount: -Number(amount),
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal (${asset}) from ${walletType} to ${address.slice(0, 8)}...`,
      createdAt: new Date()
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    // 6️⃣ Create withdrawal record
    // Note: create() returns an array when used with session
    const [withdrawal] = await Withdrawal.create([{
      user: userId,
      asset,
      walletSource: walletType,
      address,
      amount: Number(amount),
      status: 'pending'
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request transmitted to Security Node',
      withdrawal
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error(`[WITHDRAWAL_ERROR]: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * Admin withdrawal update (approve, reject, complete)
 */
export const adminUpdateWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    const { status, adminNote, txHash } = req.body;

    const withdrawal = await Withdrawal.findById(id).session(session);
    if (!withdrawal) throw new Error('Record not found');
    
    // Prevent re-processing
    if (withdrawal.status !== 'pending') throw new Error('Request already processed');

    const user = await User.findById(withdrawal.user).session(session);
    if (!user) throw new Error('User associated with this withdrawal no longer exists');

    // 1️⃣ Handle Rejection (Refund Logic)
    if (status === 'rejected') {
      const balanceKey = withdrawal.walletSource === 'profit' ? 'EUR_PROFIT' : 'EUR';
      const current = user.balances.get(balanceKey) || 0;

      user.balances.set(balanceKey, current + withdrawal.amount);
      user.ledger.push({
        amount: withdrawal.amount,
        currency: 'EUR',
        type: 'deposit',
        status: 'completed',
        description: `Refund: Rejected Withdrawal #${id.slice(-6)}`
      });

      user.markModified('balances');
      user.markModified('ledger');
      await user.save({ session });
    } 
    
    // 2️⃣ Handle Completion (Update ledger status if necessary)
    if (status === 'completed') {
       // Optional: Update the specific pending ledger entry to 'completed'
       // This keeps the user's history accurate
       const ledgerEntry = user.ledger.find(entry => 
         entry.type === 'withdrawal' && 
         entry.status === 'pending' && 
         Math.abs(entry.amount) === withdrawal.amount
       );
       if (ledgerEntry) ledgerEntry.status = 'completed';
       user.markModified('ledger');
       await user.save({ session });
    }

    // 3️⃣ Update Withdrawal Record
    withdrawal.status = status;
    withdrawal.adminNote = adminNote;
    withdrawal.txHash = txHash || withdrawal.txHash;
    await withdrawal.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: `Withdrawal status updated to: ${status}` });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error(`[ADMIN_WITHDRAWAL_ERROR]: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
