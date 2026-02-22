import User from '../models/User.js';
import axios from 'axios';

const MEMPOOL = 'https://mempool.space/api';
const COINGECKO = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur';
const MIN_CONFIRMATIONS = 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Validates a BTC address format locally before hitting the API
 */
const isValidBtcAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  // Basic check: BTC addresses are 26-62 chars and don't contain spaces
  const btcRegex = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
  return btcRegex.test(address);
};

export async function checkBtcDeposits() {
  try {
    const users = await User.find({ btcAddress: { $exists: true, $ne: "" }, banned: false });
    if (!users.length) return;

    // 1. Get Price & Current Block Height
    let btcToEur = 90000;
    let currentHeight = 0;
    try {
      const [priceRes, tipRes] = await Promise.all([
        axios.get(COINGECKO),
        axios.get(`${MEMPOOL}/blocks/tip/height`)
      ]);
      btcToEur = priceRes.data.bitcoin.eur;
      currentHeight = tipRes.data;
    } catch (err) {
      console.error("⚠️ [WATCHER] Price/Height fetch failed, using fallbacks.");
    }

    for (const user of users) {
      // ✅ FIX: Skip invalid addresses to prevent 400 errors
      if (!isValidBtcAddress(user.btcAddress)) {
        // Silent skip for "test" data, or log once
        continue;
      }

      try {
        const res = await axios.get(`${MEMPOOL}/address/${user.btcAddress}/txs`);
        
        // Handle case where address has no transactions (Mempool might return empty array)
        if (!res.data || !Array.isArray(res.data)) continue;

        for (const tx of res.data) {
          if (!tx.status.confirmed) continue;

          const confirmations = currentHeight - tx.status.block_height + 1;
          if (confirmations < MIN_CONFIRMATIONS) continue;

          for (const vout of tx.vout) {
            if (vout.scriptpubkey_address !== user.btcAddress) continue;

            const amountSats = vout.value;
            const amountBtc = amountSats / 1e8;
            const amountEur = amountBtc * btcToEur;

            // Check if already credited
            const alreadyExists = user.btcDeposits.some(d => d.txid === tx.txid && d.vout === vout.n);
            if (alreadyExists) continue;

            // Atomic update
            await User.updateOne(
              { _id: user._id },
              {
                $push: {
                  btcDeposits: {
                    txid: tx.txid,
                    vout: vout.n,
                    amountSats,
                    amountBtc,
                    amountEur,
                    blockHeight: tx.status.block_height,
                    status: 'credited',
                    creditedAt: new Date()
                  },
                  ledger: {
                    amount: amountEur,
                    currency: 'EUR',
                    type: 'deposit',
                    status: 'completed',
                    description: `BTC Deposit +${amountBtc.toFixed(8)} BTC`,
                    createdAt: new Date()
                  }
                },
                $inc: {
                  'balances.BTC': amountBtc,
                  'balances.EUR': amountEur
                }
              }
            );
            console.log(`✅ [CREDITED] ${user.email}: +${amountBtc} BTC`);
          }
        }
        
        // Wait 1.5s to respect Mempool public rate limits
        await sleep(1500); 

      } catch (err) {
        if (err.response?.status === 429) {
          console.warn("🛑 [RATE_LIMIT] Mempool hit. Ending cycle.");
          return;
        }
        // Specific log for the 400 error we were seeing
        if (err.response?.status === 400) {
          console.error(`⚠️ [BAD_ADDRESS] ${user.email} has invalid address: ${user.btcAddress}`);
        } else {
          console.error(`❌ [SYNC_ERROR] ${user.email}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ [FATAL_WATCHER_ERROR]:", err.message);
  }
}

export const startBtcDaemon = (minutes = 10) => {
  setInterval(checkBtcDeposits, minutes * 60 * 1000);
  setTimeout(checkBtcDeposits, 5000);
  console.log(`🚀 BTC Watcher: ${minutes}m cycle.`);
};

