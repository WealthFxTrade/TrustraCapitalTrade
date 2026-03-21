import { applyTransaction, convertToEur } from '../services/financeService.js';
import Deposit from '../models/Deposit.js';
import AuditLog from '../models/AuditLog.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const createDeposit = async (req, res, next) => {
  try {
    const { amount, currency = 'BTC', txHash } = req.body;
    const userId = req.user._id;

    if (!amount || Number(amount) <= 0) {
      throw new ApiError(400, 'A valid positive amount is required');
    }

    // Prevent duplicate transaction hash
    if (txHash) {
      const existing = await Deposit.findOne({ txHash });
      if (existing) throw new ApiError(400, 'This transaction hash has already been submitted');
    }

    // Get deposit address for crypto
    const depositAddress = await getOrCreateBtcDepositAddress(userId);

    if (!depositAddress) throw new ApiError(500, 'Failed to generate deposit address');

    // Convert crypto amount to EUR for record
    const amountEUR = currency === 'EUR' ? amount : await convertToEur(currency, amount);

    // Apply transaction (does NOT credit the balance yet if you want pending logic)
    const { transaction } = await applyTransaction({
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      walletAddress: depositAddress,
      referenceId: null,
      description: 'User deposit request'
    });

    // Store in Deposit collection for admin confirmation
    const deposit = await Deposit.create({
      user: userId,
      currency,
      amount,
      amountEUR,
      address: depositAddress,
      txHash: txHash || null,
      status: 'pending',
      method: 'crypto'
    });

    // Audit log
    await AuditLog.create({
      admin: null,
      action: 'deposit_initiated',
      target: userId,
      details: { amount, currency, txHash, depositId: deposit._id }
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request created – awaiting confirmation',
      deposit,
      transaction
    });
  } catch (err) {
    next(err);
  }
};
