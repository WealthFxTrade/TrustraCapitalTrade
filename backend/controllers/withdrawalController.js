import mongoose from 'mongoose';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';

/**
 * Trustra Capital Trade - Withdrawal Controller (Rio Series 2026)
 * Upgraded to support Profit vs. Main wallet selection.
 */

export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, asset, address, walletType } = req.body; // walletType: 'main' or 'profit'
    const userId = req.user._id;

    // 1. Validation Logic
    if (!amount || Number(amount) < 50) throw new Error('Minimum withdrawal is €50.00');
    if (!['BTC', 'ETH', 'USDT', 'EUR'].includes(asset)) throw new Error('Unsupported asset gateway');
    if (!address || address.length < 20) throw new Error('Invalid destination address');

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User Node not found');

    // ✅ FIX: Determine which balance key to check (EUR vs EUR_PROFIT)
    const balanceKey = (walletType === 'profit') ? 'EUR_PROFIT' : 'EUR';
    const currentBalance = user.balances.get(balanceKey) || 0;

    // 2. Anti-Fraud: Liquidity Check
    if (currentBalance < Number(amount)) {
      throw new Error(`Insufficient funds in ${walletType} wallet. Available: €${currentBalance}`);
    }

    // 3. Atomic Deduction
    user.balances.set(balanceKey, currentBalance - Number(amount));

    // 4. Update Ledger (2026 Audit Format)
    user.ledger.push({
      amount: -Number(amount),
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal from ${walletType} to ${address.slice(0, 8)}...`,
      createdAt: new Date()
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    // 5. Create Detailed Withdrawal Record
    const withdrawal = await Withdrawal.create([{
      user: userId,
      asset: asset, // Gateway used (e.g. BTC)
      walletSource: walletType, // Source (e.g. profit)
      address,
      amount: Number(amount),
      status: 'pending'
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request transmitted to Security Node',
      withdrawal: withdrawal[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error(`[WITHDRAWAL_ERROR]: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve history' });
  }
};

export const adminUpdateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote, txHash } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Record not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    if (status === 'rejected') {
      const user = await User.findById(withdrawal.user);
      // ✅ FIX: Refund specifically to the source wallet it came from
      const balanceKey = (withdrawal.walletSource === 'profit') ? 'EUR_PROFIT' : 'EUR';
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
      await user.save();
    }

    withdrawal.status = status;
    withdrawal.adminNote = adminNote;
    withdrawal.txHash = txHash;
    await withdrawal.save();

    res.json({ success: true, message: `Withdrawal ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

