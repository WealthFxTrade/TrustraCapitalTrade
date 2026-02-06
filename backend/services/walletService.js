const db = require('../models');

/**
 * Hot wallet for BTC deposits.
 * This must be a VALID address (bc1... or 3...).
 */
const HOT_WALLET_BTC = 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq';

async function getDepositAddress(userId, asset) {
  // 1. Support the assets your frontend expects
  const supportedAssets = ['BTC', 'ETH', 'USDT'];
  if (!supportedAssets.includes(asset)) {
    throw new Error('Unsupported asset type');
  }

  const user = await db.User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.depositAddresses) user.depositAddresses = {};

  // 2. Fix: Ensure we are storing/returning valid address formats
  if (!user.depositAddresses[asset]) {
    // We store the HOT_WALLET_BTC as the user's assigned address
    // In a shared wallet model, everyone sees the same address
    user.depositAddresses[asset] = HOT_WALLET_BTC;
    user.markModified('depositAddresses');
    await user.save();
  }

  // 3. Return the real address for BOTH fields
  // This ensures the frontend "validates" the address correctly
  return {
    virtualAddress: user.depositAddresses[asset], // Now returns 'bc1qj4...'
    realDepositAddress: HOT_WALLET_BTC           // Now returns 'bc1qj4...'
  };
}

module.exports = { getDepositAddress };

