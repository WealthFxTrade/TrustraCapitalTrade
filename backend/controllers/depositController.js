import Deposit from '../models/Deposit.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import axios from 'axios';

/**
 * @desc    Initializes a new deposit record
 * @access  Private (Authenticated)
 */
export async function createDeposit(req, res, next) {
  try {
    const { amount, currency, txHash } = req.body;
    const userId = req.user._id;

    // 1. Validation: Ensure positive numeric amount
    if (!amount || Number(amount) <= 0) {
      throw new ApiError(400, 'A valid positive amount is required');
    }

    // 2. Security: System assigns deposit address
    const systemAddress = await getOrCreateBtcDepositAddress(userId);
    if (!systemAddress) {
      throw new ApiError(500, 'Internal Node Error: Could not derive deposit address');
    }

    // 3. Oracle Price Sync
    // Fetch BTC->EUR rate; fallback if CoinGecko unavailable
    let amountEUR = 0;
    try {
      const priceRes = await axios.get('https://api.coingecko.com', { timeout: 5000 });
      const currentBtcRate = priceRes.data.bitcoin.eur;
      amountEUR = Number(amount) * currentBtcRate;
    } catch (e) {
      console.warn("Oracle Timeout: Using Feb 2026 fallback rate (€55,415)");
      amountEUR = Number(amount) * 55415.40;
    }

    // 4. Duplicate TX Hash check
    if (txHash) {
      const existing = await Deposit.findOne({ txHash }).lean();
      if (existing) throw new ApiError(400, 'This transaction hash has already been logged');
    }

    // 5. Create deposit record
    const deposit = await Deposit.create({
      user: userId,
      currency: currency?.toUpperCase() || 'BTC',
      amount: Number(amount),
      amountEUR: Number(amountEUR.toFixed(2)),
      address: systemAddress,
      status: 'pending',
      txHash: txHash || `INTERNAL_ID_${Date.now()}`,
      method: 'crypto_gateway_v8',
    });

    res.status(201).json({
      success: true,
      message: 'Deposit intent synchronized with network',
      deposit
    });
  } catch (err) {
    next(err); // Send error to centralized middleware
  }
}
