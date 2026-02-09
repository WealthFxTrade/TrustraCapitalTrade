import User from '../models/User.js';
import axios from 'axios';
import toast from 'react-hot-toast'; // Optional for server-side logging/alerts

/**
 * Checks BlockCypher for deposits to active BTC addresses.
 * Updates the User's Map-based balance and the Ledger history.
 */
export async function checkBtcDeposits() {
  try {
    // 1. Fetch only users who have a BTC deposit address generated
    const users = await User.find({ "depositAddresses.BTC": { $exists: true } });
    
    console.log(`[BTC_WATCHER] Scanning ${users.length} active deployment nodes...`);

    for (const user of users) {
      const address = user.depositAddresses.get('BTC');
      
      try {
        // 2. Fetch balance from BlockCypher (Satoshi units)
        // Note: final_balance includes confirmed transactions.
        const res = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
        const confirmedSatoshis = res.data.final_balance;
        
        if (confirmedSatoshis > 0) {
          const btcAmount = confirmedSatoshis / 1e8; // Convert to BTC
          const currentBtcBalance = user.balances.get('BTC') || 0;

          // 3. Only update if there is a NEW deposit (On-chain > DB)
          if (btcAmount > currentBtcBalance) {
            const difference = btcAmount - currentBtcBalance;

            // 4. Update Balance (Atomic Map update)
            user.balances.set('BTC', btcAmount);

            // 5. Add to Ledger for UI history
            user.ledger.push({
              amount: difference,
              currency: 'BTC',
              type: 'deposit',
              status: 'completed',
              description: `On-chain BTC Node Sync: ${address.slice(0, 6)}...`,
              createdAt: new Date()
            });

            // 6. Save changes
            user.markModified('balances');
            user.markModified('ledger');
            await user.save();

            console.log(`[BTC_DEPOSIT_SYNCED] User: ${user.email}, Amount: +${difference} BTC`);
          }
        }
      } catch (err) {
        // Handle BlockCypher rate limits (3 requests/sec for free tier)
        if (err.response?.status === 429) {
          console.warn(`[BTC_WATCHER] Rate limited. Sleeping...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error(`[BTC_SYNC_FAILED] Address: ${address}`, err.message);
        }
      }
    }
  } catch (globalErr) {
    console.error(`[BTC_WATCHER_CRITICAL]`, globalErr.message);
  }
}

/**
 * Recurring Daemon for Server.js
 */
export const startBtcDaemon = (minutes = 10) => {
  setInterval(checkBtcDeposits, minutes * 60 * 1000);
  console.log(`[SYSTEM] BTC Node Watcher initialized: ${minutes}m cycle.`);
};

