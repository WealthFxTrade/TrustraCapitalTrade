// utils/btcWatcher.js
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';
import { getAssetPriceEur } from './cryptoPrices.js';

/**
 * 🛰️ BTC INSTITUTIONAL WATCHER
 * Production-grade Bitcoin deposit monitoring for Trustra Capital
 * Uses the new walletAddresses map (separate from balances)
 */
export const watchBtcDeposits = async (io) => {
  try {
    // Fetch users who have a BTC deposit address
    const users = await User.find({
      'walletAddresses.BTC': { $exists: true, $ne: '' },
      isActive: true,
      isBanned: false
    }).select('_id email walletAddresses balances').lean();

    if (!users || users.length === 0) {
      console.log('📡 [BTC WATCHER] No users with BTC deposit addresses found.');
      return;
    }

    const btcPriceEur = await getAssetPriceEur('BTC');
    if (!btcPriceEur) {
      console.warn('⚠️ [BTC WATCHER] Failed to fetch BTC EUR price. Skipping scan.');
      return;
    }

    console.log(`📡 [BTC WATCHER] Scanning ${users.length} BTC addresses...`);

    for (const user of users) {
      const address = user.walletAddresses.BTC || user.walletAddresses.get?.('BTC');
      if (!address) continue;

      try {
        // Fetch transaction history from blockchain.info
        const { data } = await axios.get(
          `https://blockchain.info/rawaddr/${address}?limit=50`,
          { timeout: 10000 }
        );

        if (!data?.txs || data.txs.length === 0) continue;

        for (const tx of data.txs) {
          // Only process confirmed transactions
          if (!tx.block_height) continue;

          // Calculate incoming sats to this address
          const incomingSats = tx.out
            .filter(o => o.addr === address)
            .reduce((sum, o) => sum + (o.value || 0), 0);

          if (incomingSats <= 1000) continue; // Ignore dust (< 0.00001 BTC)

          const btcAmount = incomingSats / 1e8;
          const eurValue = btcAmount * btcPriceEur;

          // Idempotency: Check if this tx was already processed
          const existingTx = await Transaction.findOne({
            txHash: tx.hash,
            type: 'deposit'
          });

          if (existingTx) continue;

          // Atomic balance update
          const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            {
              $inc: {
                'balances.BTC': Number(btcAmount.toFixed(8)),
                'balances.EUR': Number(eurValue.toFixed(2))
              }
            },
            { new: true }
          );

          // Create audit record
          await Transaction.create({
            user: user._id,
            type: 'deposit',
            cryptoCurrency: 'BTC',
            cryptoAmount: Number(btcAmount.toFixed(8)),
            amount: Number(eurValue.toFixed(2)),
            currency: 'EUR',
            status: 'completed',
            method: 'onchain',
            walletAddress: address,
            txHash: tx.hash,
            confirmations: tx.confirmations || 1,
            description: `BTC Deposit: ${btcAmount.toFixed(8)} BTC`,
            metadata: {
              source: 'btc_watcher',
              satsReceived: incomingSats,
              processedAt: new Date()
            }
          });

          console.log(`💰 [BTC] Credited \( {btcAmount.toFixed(8)} BTC → \){user.email} (€${eurValue.toFixed(2)})`);

          // Real-time notification
          if (io && updatedUser) {
            io.to(user._id.toString()).emit('balanceUpdate', {
              userId: user._id,
              balances: Object.fromEntries(updatedUser.balances || new Map()),
              message: `✅ BTC deposit confirmed: +${btcAmount.toFixed(8)} BTC`
            });
          }
        }
      } catch (err) {
        console.error(`[BTC ADDRESS ERROR] \( {address} ( \){user.email || user._id}):`, err.message);
      }
    }

    console.log('✅ [BTC WATCHER] Scan cycle complete.');
  } catch (err) {
    console.error('⚠️ [BTC WATCHER FATAL ERROR]:', err.message);
  }
};
