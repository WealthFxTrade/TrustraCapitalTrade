import User from '../models/User.js';
import { deriveAddressFromXpub } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get or create BTC deposit address for a user using XPUB derivation
 * @param {string} userId
 * @param {boolean} fresh - If true, derives the next available address in the sequence
 */
export async function getOrCreateBtcDepositAddress(userId, fresh = false) {
  // 1. Fetch user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const xpub = process.env.BITCOIN_XPUB;
  if (!xpub) {
    throw new ApiError(500, 'Server configuration error: BITCOIN_XPUB missing');
  }

  // 2. Return existing address if available and no fresh address is requested
  if (user.btcAddress && !fresh) {
    return user.btcAddress;
  }

  try {
    /**
     * 3. Address Derivation Logic
     * If 'fresh' is true, we increment the global index for this user.
     * This ensures the user gets a unique address for every new deposit request,
     * which is standard for privacy in 2026.
     */
    const nextIndex = fresh ? (user.btcIndex + 1) : user.btcIndex;
    
    // deriveAddressFromXpub handles the cryptographic path (m/0/index)
    const newAddress = deriveAddressFromXpub(xpub, nextIndex);

    // 4. Update User Model
    // We use findByIdAndUpdate to avoid potential version conflicts (optimistic locking)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { 
          btcAddress: newAddress,
          btcIndex: nextIndex 
        }
      },
      { new: true, runValidators: true }
    );

    return updatedUser.btcAddress;
  } catch (err) {
    console.error(`[ADDRESS_SERVICE_ERROR] User: ${userId}`, err.message);
    throw new ApiError(500, 'Failed to derive secure Bitcoin address');
  }
}

