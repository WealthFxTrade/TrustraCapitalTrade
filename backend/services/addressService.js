import User from '../models/User.js';
import { deriveAddressFromXpub } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get or create BTC deposit address for a user using XPUB derivation
 * @param {string} userId
 * @param {boolean} fresh - If true, increments index to generate a NEW address
 */
export async function getOrCreateBtcDepositAddress(userId, fresh = false) {
  const xpub = process.env.BITCOIN_XPUB;
  
  if (!xpub) {
    throw new ApiError(500, 'Secure Vault Error: BITCOIN_XPUB not configured');
  }

  // 1. Fetch user data
  const user = await User.findById(userId).select('btcAddress btcIndex').lean();
  if (!user) throw new ApiError(404, 'User not found in Trustra database');

  // 2. Return existing if not asking for a fresh one
  if (user.btcAddress && !fresh) {
    return user.btcAddress;
  }

  try {
    // 3. ATOMIC UPDATE: Increment index safely to prevent race conditions
    // If 'fresh' is true, we move to the next index in the HD wallet path
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { btcIndex: fresh ? 1 : 0 } }, // Increment only if fresh requested
      { new: true, upsert: true }
    ).select('btcIndex');

    /**
     * 4. Derivation Logic (m/0/index)
     * Standard SegWit (P2WPKH) derivation for 2026.
     * Ensure your bitcoinUtils.js uses the 'mainnet' network constant.
     */
    const newAddress = deriveAddressFromXpub(xpub, updatedUser.btcIndex);

    // 5. Save the generated address back to the user
    await User.findByIdAndUpdate(userId, { 
      $set: { btcAddress: newAddress } 
    });

    return newAddress;
  } catch (err) {
    console.error(`[CRITICAL_ADDRESS_ERROR] ${userId}:`, err.message);
    throw new ApiError(500, 'Cryptographic Derivation Failed: Check XPUB format');
  }
}

