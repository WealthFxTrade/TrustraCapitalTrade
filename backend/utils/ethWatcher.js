// utils/ethWatcher.js
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { deriveEthAddress, getEthBalance, getUsdtBalance } from './ethUtils.js';
import { getAssetPriceEur } from './cryptoPrices.js';

/**
 * 🛰️ ETH & USDT INSTITUTIONAL WATCHER
 * Production-grade on-chain deposit monitoring for Trustra Capital
 * Uses the new walletAddresses map and robust ethUtils
 */
export const watchEthDeposits = async (io) => {
  try {
    // Fetch active users who have an address_index
    const users = await User.find({
      address_index: { $exists: true, $ne: null },
      isActive: true,
      isBanned: false
    }).select('_id email address_index balances walletAddresses').lean();

    if (!users || users.length === 0) {
      console.log('📡 [ETH WATCHER] No active users with address_index found.');
      return;
    }

    // Fetch EUR prices once per scan cycle
    const ethPriceEur = await getAssetPriceEur('ETH') || 0;
    const usdtPriceEur = await getAssetPriceEur('USDT') || 0.93;

    console.log(`📡 [ETH WATCHER] Scanning ${users.length} institutional addresses...`);

    for (const user of users) {
      let derivedAddress = null;

      try {
        // Derive the user's unique ETH address
        const derived = deriveEthAddress(user.address_index);
        derivedAddress = derived.address;

        if (!derivedAddress || !derivedAddress.startsWith('0x')) {
          console.warn(`⚠️ Invalid derived ETH address for user ${user.email || user._id}`);
          continue;
        }

        // Fetch balances safely (parallel + individual error handling)
        const [ethResult, usdtResult] = await Promise.allSettled([
          getEthBalance(derivedAddress),
          getUsdtBalance(derivedAddress)
        ]);

        const ethBalanceStr = ethResult.status === 'fulfilled' ? ethResult.value : '0';
        const usdtBalanceStr = usdtResult.status === 'fulfilled' ? usdtResult.value : '0';

        const ethAmount = parseFloat(ethBalanceStr) || 0;
        const usdtAmount = parseFloat(usdtBalanceStr) || 0;

        // Process ETH deposit (ignore dust)
        if (ethAmount > 0.0001) {
          await processEthDeposit(user, 'ETH', ethAmount, ethPriceEur, derivedAddress, io);
        }

        // Process USDT deposit (ignore dust < 1 USDT)
        if (usdtAmount > 1) {
          await processEthDeposit(user, 'USDT', usdtAmount, usdtPriceEur, derivedAddress, io);
        }

      } catch (userErr) {
        console.error(`❌ [ETH WATCHER] Error processing user \( {user.email || user._id} ( \){derivedAddress || 'N/A'}):`, userErr.message);
      }
    }

    console.log('✅ [ETH WATCHER] Scan cycle complete.');
  } catch (err) {
    console.error('⚠️ [ETH WATCHER FATAL ERROR]:', err.message);
  }
};

/**
 * Atomic & Idempotent Deposit Processor
 */
async function processEthDeposit(user, symbol, rawAmount, priceEur, walletAddress, io) {
  const eurValue = rawAmount * priceEur;

  // Strong idempotency check (prevent double-crediting)
  const existingTx = await Transaction.findOne({
    user: user._id,
    walletAddress: walletAddress,
    type: 'deposit',
    cryptoCurrency: symbol,
    createdAt: { $gt: new Date(Date.now() - 72 * 60 * 60 * 1000) } // 72-hour window
  }).lean();

  if (existingTx && Math.abs(existingTx.cryptoAmount - rawAmount) < 0.000001) {
    console.log(`⏩ [\( {symbol}] Deposit already processed for \){user.email}`);
    return;
  }

  // Atomic balance update using $inc (safe for concurrent operations)
  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    {
      $inc: {
        [`balances.${symbol}`]: Number(rawAmount.toFixed(8)),
        'balances.EUR': Number(eurValue.toFixed(2))
      }
    },
    { new: true }
  );

  // Create immutable audit trail
  await Transaction.create({
    user: user._id,
    type: 'deposit',
    cryptoCurrency: symbol,
    cryptoAmount: Number(rawAmount.toFixed(8)),
    amount: Number(eurValue.toFixed(2)),
    currency: 'EUR',
    status: 'completed',
    method: 'onchain',
    walletAddress: walletAddress,
    description: `Institutional \( {symbol} Deposit: \){rawAmount} ${symbol}`,
    metadata: {
      source: 'eth_watcher',
      priceEurUsed: priceEur,
      processedAt: new Date()
    }
  });

  console.log(`💰 [\( {symbol}] Credited \){rawAmount} \( {symbol} → \){user.email} (€${eurValue.toFixed(2)})`);

  // Real-time balance update via socket
  if (io && updatedUser) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      userId: user._id,
      balances: Object.fromEntries(updatedUser.balances || new Map()),
      message: `✅ \( {symbol} deposit confirmed: + \){rawAmount} ${symbol}`
    });
  }
}

export default watchEthDeposits;
