import User from '../models/User.js';
import { generateBtcAddressFromXpub } from '../utils/bitcoinUtils.js';

/**
 * Get or create BTC deposit address for a user
 * @param {string} userId
 * @param {boolean} fresh - whether to generate a new address
 */
export async function getOrCreateBtcDepositAddress(userId, fresh = false) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.depositAddresses = user.depositAddresses || {};

  if (!user.depositAddresses.BTC || fresh) {
    const newAddress = await generateBtcAddressFromXpub(userId);
    user.depositAddresses.BTC = newAddress;
    await user.save();
  }

  return user.depositAddresses.BTC;
}
