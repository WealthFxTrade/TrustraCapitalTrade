import User from '../models/User.js';
import axios from 'axios';

/**
 * ₿ BTC WATCHER: Syncs on-chain deposits and converts value to EUR
 */
export async function checkBtcDeposits() {
  try {
    const users = await User.find({ btcAddress: { $exists: true, $ne: "" } });
    if (!users.length) return;

    // ✅ FIXED CoinGecko endpoint
    let btcToEurPrice = 0;

    try {
      const priceRes = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
      );
      btcToEurPrice = priceRes.data.bitcoin.eur;
    } catch (err) {
      console.error("❌ [PRICE_SYNC_FAILED] Using fallback.");
      btcToEurPrice = 90000; // Fallback
    }

    for (const user of users) {
      if (
        !user.btcAddress ||
        user.btcAddress.startsWith('xpub') ||
        user.btcAddress.length < 26
      ) continue;

      try {
        // ✅ FIXED BlockCypher endpoint
        const res = await axios.get(
          `https://api.blockcypher.com/v1/btc/main/addrs/${user.btcAddress}/balance`
        );

        const confirmedSatoshis = res.data.balance; // confirmed only
        const onChainBtc = confirmedSatoshis / 1e8;

        const storedBtc = user.balances.get('BTC') || 0;

        // Only credit confirmed NEW deposits
        if (onChainBtc > storedBtc) {
          const newBtc = onChainBtc - storedBtc;
          const eurValue = newBtc * btcToEurPrice;

          user.balances.set('BTC', onChainBtc);

          const currentEur = user.balances.get('EUR') || 0;
          user.balances.set('EUR', currentEur + eurValue);

          user.ledger.push({
            amount: eurValue,
            currency: 'EUR',
            type: 'deposit',
            status: 'completed',
            description: `On-chain BTC Deposit: +${newBtc.toFixed(6)} BTC`,
            createdAt: new Date()
          });

          user.markModified('balances');
          user.markModified('ledger');
          await user.save();

          console.log(
            `✅ [BTC_SYNC] ${user.email}: +€${eurValue.toFixed(2)} credited.`
          );
        }

        // Prevent rate limits
        await new Promise(r => setTimeout(r, 1100));

      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(`⚠️ [SYNC_SKIP] ${user.email}: ${err.message}`);
        }
      }
    }

  } catch (err) {
    console.error(`❌ [CRITICAL_WATCHER_ERROR]`, err.message);
  }
}

/**
 * 🚀 DAEMON
 */
export const startBtcDaemon = (minutes = 5) => {
  setInterval(checkBtcDeposits, minutes * 60 * 1000);
  setTimeout(checkBtcDeposits, 5000);
  console.log(`[SYSTEM] BTC Node Watcher initialized: ${minutes}m cycle.`);
};
