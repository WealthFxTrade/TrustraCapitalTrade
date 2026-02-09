const db = require('../models');
const { deriveBtcAddress } = require('../utils/btcUtils'); // adjust path if needed

const MASTER_XPUB = process.env.BITCOIN_XPUB;

if (!MASTER_XPUB) {
  console.error('[FATAL] BITCOIN_XPUB is not set in environment variables');
  process.exit(1); // or throw – depending on your startup strategy
}

/**
 * Gets or generates a unique deposit address for a user and asset.
 * For BTC: derives from HD wallet using atomic index counter.
 * For other assets: placeholder (implement as needed).
 */
async function getDepositAddress(userId, asset = 'BTC') {
  const upperAsset = asset.toUpperCase();

  if (!['BTC', 'USDT', 'ETH'].includes(upperAsset)) {
    throw new Error(`Unsupported asset: ${upperAsset}`);
  }

  const user = await db.User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Initialize depositAddresses if missing
  if (!user.depositAddresses) {
    user.depositAddresses = {};
  }

  // Return existing address if already generated
  if (user.depositAddresses[upperAsset]) {
    return {
      virtualAddress: user.depositAddresses[upperAsset],
      realDepositAddress: user.depositAddresses[upperAsset],
      alreadyExisted: true
    };
  }

  let address;

  try {
    if (upperAsset === 'BTC') {
      // Get or assign unique derivation index
      if (user.btcIndex == null) {
        // Atomically increment global counter
        const counter = await db.Counter.findOneAndUpdate(
          { _id: 'btcDerivationIndex' },
          { $inc: { seq: 1 } },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
          }
        );

        user.btcIndex = counter.seq - 1; // start from 0 (most common)
        // Alternative: user.btcIndex = counter.seq; // start from 1
      }

      address = deriveBtcAddress(MASTER_XPUB, user.btcIndex, 0); // change=0 = receive

      console.info('[NEW_BTC_DEPOSIT_ADDRESS]', {
        userId: user._id.toString(),
        btcIndex: user.btcIndex,
        address,
        timestamp: new Date().toISOString()
      });
    } else {
      // Placeholder – implement for ETH / USDT (e.g. same address, or generate via ethers.js / viem)
      address = `Not yet implemented for ${upperAsset}`;
      // Or: throw new Error(`Address generation not implemented for ${upperAsset}`);
    }

    // Save the new address
    user.depositAddresses[upperAsset] = address;
    user.markModified('depositAddresses');
    await user.save();

    return {
      virtualAddress: address,
      realDepositAddress: address,
      newlyGenerated: true
    };
  } catch (error) {
    console.error('[GET_DEPOSIT_ADDRESS_FAILED]', {
      userId: user._id.toString(),
      asset: upperAsset,
      btcIndex: user.btcIndex,
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 300)
    });

    throw new Error('Failed to generate or retrieve deposit address');
  }
}

module.exports = { getDepositAddress };
