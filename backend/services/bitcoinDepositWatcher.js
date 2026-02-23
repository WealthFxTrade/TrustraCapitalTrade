import User from '../models/User.js';
import axios from 'axios';

/**
 * ₿ BTC WATCHER: Syncs on-chain deposits and converts value to EUR
 */
export async function checkBtcDeposits() {
  try {
    // SYNC: Matches your User model field 'btcAddress'
    const users = await User.find({ btcAddress: { $exists: true } });

    // 1. Get current BTC price once per scan to save API calls
    const priceRes = await axios.get('https://api.coingecko.com');
    const btcToEurPrice = priceRes.data.bitcoin.eur;

    for (const user of users) {
      const address = user.btcAddress;

      try {
        // 2. Fetch from BlockCypher (Satoshi units)
        const res = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
        const onChainSats = res.data.final_balance;
        const onChainBtc = onChainSats / 1e8;

        const currentBtcBalance = user.balances.get('BTC') || 0;

        // 3. Detect NEW Deposit
        if (onChainBtc > currentBtcBalance) {
          const newBtcAmount = onChainBtc - currentBtcBalance;
          const eurValue = newBtcAmount * btcToEurPrice;

          // 4. Update Balances (BTC & EUR Equity)
          user.balances.set('BTC', onChainBtc);
          
          const currentEur = user.balances.get('EUR') || 0;
          user.balances.set('EUR', currentEur + eurValue);

          // 5. Log to Ledger (Dashboard Visibility)
          user.ledger.push({
            amount: eurValue,
            currency: 'EUR',
            type: 'deposit',
            status: 'completed',
            description: `On-chain Sync: +${newBtcAmount.toFixed(6)} BTC (@ €${btcToEurPrice.toLocaleString()})`,
            createdAt: new Date()
          });

          user.markModified('balances');
          user.markModified('ledger');
          await user.save();

          console.log(`[BTC_SYNC] ${user.email}: +${newBtcAmount} BTC (Value: €${eurValue.toFixed(2)})`);
        }

        // Sleep 500ms to avoid BlockCypher 429 Rate Limits
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        if (err.response?.status === 429) {
          await new Promise(r => setTimeout(r, 5000)); // Long sleep if rate limited
        }
      }
    }
  } catch (err) {
    console.error(`[CRITICAL_WATCHER_ERROR]`, err.message);
  }
}

export const startBtcDaemon = (minutes = 10) => {
  setInterval(checkBtcDeposits, minutes * 60 * 1000);
  checkBtcDeposits(); // Run once on boot
  console.log(`[SYSTEM] BTC Node Watcher initialized: ${minutes}m cycle.`);
};

