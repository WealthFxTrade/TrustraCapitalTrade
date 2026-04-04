// services/addressService.js

import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get or create a unique BTC deposit address for a user
 * @param {string} userId - MongoDB User ID
 * @param {boolean} fresh - Force generation of a new address
 * @returns {Promise<string>} BTC address
 */
export async function getOrCreateBtcDepositAddress(userId, fresh = false) {
  // 1️⃣ Ensure BTC_XPUB is configured
  if (!process.env.BTC_XPUB) {
    throw new ApiError(500, 'Secure Vault Error: BTC_XPUB not configured');
  }

  // 2️⃣ Fetch user
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  // 3️⃣ Return existing address if present and not forced to refresh
  if (user.btcAddress && !fresh) {
    return user.btcAddress;
  }

  try {
    // 4️⃣ Atomic counter for index
    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true }
    );

    const index = counterDoc.btcIndexCounter;

    // 5️⃣ Derive BTC address using corrected utility
    const { address } = deriveBtcAddress(index);
    if (!address) throw new Error('BTC derivation failed');

    // 6️⃣ Save to user
    user.btcAddress = address;
    user.btcIndex = index;
    await user.save();

    console.log(`✅ BTC Address assigned → ${address} (index ${index}) for user ${userId}`);
    return address;

  } catch (err) {
    console.error(`[CRITICAL_ADDRESS_ERROR] User: ${userId} |`, err.message);
    throw new ApiError(500, 'BTC address generation failed');
  }
}
