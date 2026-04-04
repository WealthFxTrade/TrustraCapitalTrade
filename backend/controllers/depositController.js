// controllers/depositController.js
import { applyTransaction, convertToEur } from '../services/financeService.js';
import Deposit from '../models/Deposit.js';
import AuditLog from '../models/AuditLog.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const createDeposit = async (req, res, next) => {
  try {
    const { amount, currency = 'BTC', txHash } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) throw new ApiError(400, 'A valid positive amount is required');

    // Prevent duplicate transaction hash
    if (txHash) {
      const existing = await Deposit.findOne({ txHash });
      if (existing) throw new ApiError(400, 'This transaction hash has already been submitted');
    }

    // Generate deposit address
    const depositAddress = await getOrCreateBtcDepositAddress(userId);
    if (!depositAddress) throw new ApiError(500, 'Failed to generate deposit address');

    // Convert to EUR for ledger
    const amountEUR = currency === 'EUR' ? amount : await convertToEur(currency, amount);

    // Apply pending transaction
    const { transaction } = await applyTransaction({
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      walletAddress: depositAddress,
      referenceId: null,
      description: 'User deposit request',
    });

    // Save deposit for admin confirmation
    const deposit = await Deposit.create({
      user: userId,
      currency,
      amount,
      amountEUR,
      address: depositAddress,
      txHash: txHash || null,
      status: 'pending',
      method: 'crypto',
    });

    // Audit log
    await AuditLog.create({
      admin: null,
      action: 'deposit_initiated',
      target: userId,
      details: { amount, currency, txHash, depositId: deposit._id },
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('balanceUpdate', {
        balances: Object.fromEntries(req.user.balances),
        message: 'Deposit request submitted – awaiting confirmation',
        deposit,
        transaction,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Deposit request created – awaiting confirmation',
      deposit,
      transaction,
    });
  } catch (err) {
    next(err);
  }
};
