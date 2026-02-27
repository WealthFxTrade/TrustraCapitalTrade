// controllers/depositController.js
import Deposit from '../models/Deposit.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import axios from 'axios';
import AuditLog from '../models/AuditLog.js';

/**
 * Create a new deposit intent/record
 * - Validates input
 * - Generates or fetches deposit address
 * - Converts BTC to EUR (real-time price)
 * - Creates pending deposit record
 * - Does NOT credit balance automatically (admin action required)
 *
 * @route   POST /api/deposits
 * @access  Private
 */
export const createDeposit = async (req, res, next) => {
  try {
    const { amount, currency = 'BTC', txHash } = req.body;
    const userId = req.user._id;

    // 1. Input validation
    if (!amount || Number(amount) <= 0) {
      throw new ApiError(400, 'A valid positive amount is required');
    }

    // 2. Get system deposit address (should be user-specific in real apps)
    const depositAddress = await getOrCreateBtcDepositAddress(userId);
    if (!depositAddress) {
      throw new ApiError(500, 'Failed to generate deposit address');
    }

    // 3. Fetch real-time BTC/EUR price (no fallback)
    let amountEUR = 0;
    try {
      const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'eur',
        },
        timeout: 8000,
      });

      const rate = priceRes.data?.bitcoin?.eur;
      if (!rate || isNaN(rate)) {
        throw new Error('Failed to fetch BTC/EUR rate');
      }

      amountEUR = Number(amount) * rate;
    } catch (priceErr) {
      console.error('Price fetch error:', priceErr.message);
      throw new ApiError(503, 'Unable to fetch current BTC price – try again later');
    }

    // 4. Prevent duplicate txHash (if provided)
    if (txHash) {
      const existing = await Deposit.findOne({ txHash }).lean();
      if (existing) {
        throw new ApiError(400, 'This transaction hash has already been submitted');
      }
    }

    // 5. Create deposit record (pending admin confirmation)
    const deposit = await Deposit.create({
      user: userId,
      currency: currency.toUpperCase(),
      amount: Number(amount),
      amountEUR: Number(amountEUR.toFixed(2)),
      address: depositAddress,
      status: 'pending',
      txHash: txHash || null,
      method: 'crypto',
    });

    // 6. Audit log
    await AuditLog.create({
      admin: null, // user-initiated
      action: 'deposit_initiated',
      target: userId,
      details: {
        amount,
        currency,
        txHash,
        depositId: deposit._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request created – awaiting confirmation',
      deposit,
    });
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(500, 'Deposit creation failed'));
  }
};

/**
 * (Future) Confirm deposit & credit balance (admin or webhook)
 * Currently manual – replace with real blockchain listener
 */
export const confirmDeposit = async (req, res, next) => {
  // TODO: Implement real blockchain confirmation (e.g., via webhook or polling)
  // 1. Verify txHash on-chain (confirmations, amount)
  // 2. Credit user.balances
  // 3. Update Deposit status to 'confirmed'
  // 4. Add ledger entry
  // ...
  res.json({ success: true, message: 'Deposit confirmation endpoint (placeholder)' });
};

export default {
  createDeposit,
  confirmDeposit,
};
