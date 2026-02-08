// backend/controllers/depositController.js
import Deposit from '../models/Deposit.js';
import { confirmDeposit } from '../services/confirmDeposit.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import axios from 'axios'; // <-- for BTC → EUR conversion

/**
 * @desc    Initializes a new deposit record
 * @access  Private
 */
export async function createDeposit(req, res, next) {
  try {
    const { amount, method, currency, address, txHash } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      throw new ApiError(400, 'A valid positive amount is required');
    }

    if (!address || !currency) {
      throw new ApiError(400, 'Currency and destination address are required');
    }

    // Check for duplicate txHash
    if (txHash) {
      const existing = await Deposit.findOne({ txHash }).lean();
      if (existing) throw new ApiError(400, 'Transaction hash already submitted');
    }

    // 1️⃣ Convert BTC to EUR if needed
    let amountEUR = null;
    if (currency.toUpperCase() === 'BTC') {
      const priceRes = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
      );
      amountEUR = amount * priceRes.data.bitcoin.eur;
    }

    // 2️⃣ Create deposit
    const deposit = await Deposit.create({
      user: userId,
      currency: currency.toUpperCase(),
      amount,
      amountEUR,                 // store EUR value
      address,
      status: 'pending',
      txHash,
      method: method || 'crypto',
    });

    res.status(201).json({
      success: true,
      message: 'Deposit intent recorded successfully',
      deposit
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Fetch deposit history for the authenticated user
 */
export async function getUserDeposits(req, res, next) {
  try {
    const deposits = await Deposit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean(); // faster read

    res.json({ success: true, deposits });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Admin only: Fetch all deposits across the system
 */
export async function getAllDeposits(req, res, next) {
  try {
    const deposits = await Deposit.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: deposits.length, deposits });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Admin only: Manually trigger the confirmation service
 */
export async function manualConfirmDeposit(req, res, next) {
  try {
    const { depositId } = req.params;
    await confirmDeposit(depositId); // handles wallet update

    res.json({ success: true, message: 'Deposit confirmed and balance updated' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get or derive a BTC SegWit address
 */
export async function getOrCreateBtcDepositAddressController(req, res, next) {
  try {
    const userId = req.user._id;
    const fresh = req.query.fresh === 'true';
    const address = await getOrCreateBtcDepositAddress(userId, fresh);

    res.json({ success: true, address });
  } catch (err) {
    next(err);
  }
}

// Alias for routing consistency
export const getDepositHistory = getUserDeposits;
