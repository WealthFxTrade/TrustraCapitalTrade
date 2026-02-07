const db = require('../models');

// The valid master wallet address
const HOT_WALLET_BTC = 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq';

async function getDepositAddress(userId, asset) {
  const supportedAssets = ['BTC', 'USDT', 'ETH'];
  const upperAsset = (asset || 'BTC').toUpperCase();

  if (!supportedAssets.includes(upperAsset)) {
    throw new Error('Unsupported asset type');
  }

  const user = await db.User.findById(userId);
  if (!user) throw new Error('User not found');

  // Initialize depositAddresses object if it's currently undefined
  if (!user.depositAddresses) {
    user.depositAddresses = {};
  }

  // Assign the REAL address to bypass frontend 'invalid address' errors
  if (!user.depositAddresses[upperAsset]) {
    user.depositAddresses[upperAsset] = HOT_WALLET_BTC;
    
    // CRITICAL: Tell Mongoose the nested object has changed so it saves
    user.markModified('depositAddresses');
    await user.save();
  }

  return {
    virtualAddress: user.depositAddresses[upperAsset],
    realDepositAddress: HOT_WALLET_BTC
  };
}

module.exports = { getDepositAddress };

