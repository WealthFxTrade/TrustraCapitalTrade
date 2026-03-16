/**
 * controllers/depositController.js
 * Deposit Controller for Trustra Capital
 * Manages creation of cryptocurrency deposit intents/records.
 *
 * Responsibilities:
 *   - Validates deposit amount and currency
 *   - Generates or retrieves user-specific BTC deposit address
 *   - Fetches real-time BTC/EUR exchange rate from CoinGecko
 *   - Prevents duplicate transaction hash submissions
 *   - Creates pending deposit record (awaits admin or blockchain confirmation)
 *   - Logs audit trail for traceability
 *
 * Important: Does NOT automatically credit user balance.
 *            Requires manual admin action or blockchain webhook confirmation.
 *
 * @module controllers/depositController
 */

import Deposit from '../models/Deposit.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import axios from 'axios';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Create a new deposit intent/record
 * @route   POST /api/deposits
 * @access  Private (authenticated user)
 * @body    { amount: number, currency?: string = 'BTC', txHash?: string }
 * @returns {Object} Deposit record with pending status
 */
export const createDeposit = asyncHandler(async (req, res, next) => {
  try {
    // Step 1: Extract and normalize request body data
    const { amount, currency = 'BTC', txHash } = req.body;
    const userId = req.user._id;

    // Step 2: Validate required fields and amount
    if (!amount || Number(amount) <= 0) {
      throw new ApiError(400, 'A valid positive amount is required');
    }

    // Step 3: Retrieve or generate user-specific BTC deposit address
    const depositAddress = await getOrCreateBtcDepositAddress(userId);

    if (!depositAddress) {
      throw new ApiError(500, 'Failed to generate or retrieve deposit address');
    }

    // Step 4: Fetch real-time BTC/EUR exchange rate from CoinGecko
    let amountEUR = 0;

    try {
      const priceResponse = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin',
            vs_currencies: 'eur',
          },
          timeout: 8000, // 8-second timeout to prevent hanging
        }
      );

      const rate = priceResponse.data?.bitcoin?.eur;

      if (!rate || isNaN(rate)) {
        throw new Error('Failed to fetch valid BTC/EUR exchange rate');
      }

      amountEUR = Number(amount) * rate;
    } catch (priceError) {
      console.error('CoinGecko price fetch error:', priceError.message);
      throw new ApiError(
        503,
        'Unable to fetch current BTC price – please try again later'
      );
    }

    // Step 5: Prevent duplicate submissions by txHash (if provided)
    if (txHash) {
      const existingDeposit = await Deposit.findOne({ txHash }).lean();

      if (existingDeposit) {
        throw new ApiError(400, 'This transaction hash has already been submitted');
      }
    }

    // Step 6: Create pending deposit record in database
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

    // Step 7: Create audit log entry for traceability
    await AuditLog.create({
      admin: null, // User-initiated action (no admin involved yet)
      action: 'deposit_initiated',
      target: userId,
      details: {
        amount,
        currency,
        txHash,
        depositId: deposit._id,
      },
    });

    // Step 8: Return successful response with deposit details
    res.status(201).json({
      success: true,
      message: 'Deposit request created – awaiting confirmation',
      deposit,
    });
  } catch (error) {
    // Forward custom ApiError or wrap generic errors
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, 'Deposit creation failed')
    );
  }
});

/**
 * @desc    Confirm deposit and credit user balance
 * @route   POST /api/deposits/confirm
 * @access  Private/Admin or Webhook (future implementation)
 *
 * @note    This is currently a placeholder endpoint.
 *          In production, this should be replaced with:
 *          - Blockchain confirmation listener (e.g., Blockcypher webhook)
 *          - Balance credit logic
 *          - Ledger entry creation
 *          - Deposit status update to 'confirmed'
 *          - Real-time socket notification
 */
export const confirmDeposit = asyncHandler(async (req, res, next) => {
  // TODO: Implement real blockchain confirmation logic here

  res.status(200).json({
    success: true,
    message: 'Deposit confirmation endpoint (placeholder)',
    note: 'Replace with real blockchain confirmation logic or webhook handler',
  });
});

export default {
  createDeposit,
  confirmDeposit,
};
