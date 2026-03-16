/**
 * controllers/walletController.js
 * Wallet & Deposit Address Controller for Trustra Capital
 * Handles generation and retrieval of user-specific BTC deposit addresses
 * using hierarchical deterministic (HD) derivation from a shared hot wallet.
 *
 * Features:
 *   - Returns existing BTC address if available (unless force requested)
 *   - Derives new address from hot wallet index when needed
 *   - Persists address mapping per user
 *   - Uses upsert to avoid duplicate records
 *
 * @route   GET /api/wallet/btc-address
 * @access  Private (authenticated user)
 * @query   force=true  (optional) – forces generation of a new address
 */

import HotWallet from '../models/HotWallet.js';
import BtcAddress from '../models/BtcAddress.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

export const getBtcAddress = async (req, res) => {
  try {
    // Step 1: Get authenticated user ID from request (populated by auth middleware)
    const userId = req.user._id;

    // Step 2: Check optional query parameter 'force'
    // If force=true, always generate a new address (ignores existing)
    const { force } = req.query;
    const forceNewAddress = force === 'true';

    // Step 3: Look for an existing BTC address for this user (unless forced)
    if (!forceNewAddress) {
      const existingAddressRecord = await BtcAddress.findOne({ user: userId });

      if (existingAddressRecord) {
        // Return existing address immediately
        return res.status(200).json({
          success: true,
          address: existingAddressRecord.address,
          message: 'Existing BTC deposit address retrieved',
        });
      }
    }

    // Step 4: Get or initialize the hot wallet (central address generator)
    let hotWallet = await HotWallet.findOne({ currency: 'BTC' });

    if (!hotWallet) {
      // Create hot wallet if none exists yet
      hotWallet = await HotWallet.create({
        currency: 'BTC',
        balance: 0,
        lastIndex: 0,
      });
    }

    // Step 5: Calculate the next derivation index
    const currentIndex = hotWallet.lastIndex || 0;
    const nextIndex = currentIndex + 1;

    // Step 6: Derive a new BTC address using the next index
    const newAddress = deriveBtcAddress(nextIndex);

    // Step 7: Update the hot wallet's last used index
    hotWallet.lastIndex = nextIndex;
    await hotWallet.save();

    // Step 8: Store or update the user's address mapping (upsert)
    // This ensures each user has exactly one active BTC address record
    const userAddressRecord = await BtcAddress.findOneAndUpdate(
      { user: userId },
      {
        address: newAddress,
        index: nextIndex,
        updatedAt: Date.now(),
      },
      {
        upsert: true,     // Create if doesn't exist
        new: true,        // Return updated document
      }
    );

    // Step 9: Respond with the new address
    res.status(200).json({
      success: true,
      address: newAddress,
      message: forceNewAddress
        ? 'New BTC deposit address generated (force requested)'
        : 'BTC deposit address ready',
    });
  } catch (error) {
    // Log error for debugging (server-side)
    console.error('[Wallet Controller Error]:', error.message);

    // Return user-friendly error response
    res.status(500).json({
      success: false,
      error: 'Failed to provide BTC deposit address. Please try again later.',
    });
  }
};
