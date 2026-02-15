import User from '../models/User.js';
import { deriveAddressFromXpub } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get or create a unique BTC deposit address for a user.
 * Uses a global counter document to ensure indices never repeat.
 */
export async function getOrCreateBtcDepositAddress(userId, fresh = false) {
  const xpub = process.env.BITCOIN_XPUB;

  if (!xpub) {
    throw new ApiError(500, 'Secure Vault Error: BITCOIN_XPUB not configured');
  }

  // 1. Fetch user data
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found in Trustra database');

  // 2. Return existing address if available and no fresh one is requested
  if (user.btcAddress && !fresh) {
    return user.btcAddress;
  }

  try {
    /**
     * 3. GLOBAL ATOMIC UPDATE
     * We increment the index on the system "Counter" document.
     * This ensures every user in the entire platform gets a unique index.
     */
    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const newIndex = counterDoc.btcIndexCounter;

    /**
     * 4. Derivation Logic
     * Uses the global index to derive a unique bc1q SegWit address.
     */
    const newAddress = deriveAddressFromXpub(xpub, newIndex);

    if (!newAddress) {
      throw new Error('Derivation returned null address');
    }

    // 5. Update the specific user with their unique credentials
    user.btcAddress = newAddress;
    user.btcIndex = newIndex;
    await user.save();

    console.log(`✅ Derived index ${newIndex} for user ${userId}: ${newAddress}`);
    return newAddress;
  } catch (err) {
    console.error(`[CRITICAL_ADDRESS_ERROR] ${userId}:`, err.message);
    throw new ApiError(500, 'Cryptographic Derivation Failed: Check XPUB/ZPUB format');
  }
}

