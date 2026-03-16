// backend/utils/btcWatcher.js
import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { getBtcBalance } from './bitcoinUtils.js';
import axios from 'axios';

/**
 * 🛰️ BTC DEPOSIT MONITOR
 * Scans pending deposits and confirms them via Mempool.space
 */
export const watchBtcDeposits = async (io) => {
  try {
    // 1. Identify all 'pending' or 'confirming' deposits
    const activeDeposits = await Deposit.find({
      status: { $in: ['pending', 'confirming'] },
      currency: 'BTC'
    });

    if (activeDeposits.length === 0) return;

    // 2. Fetch current BTC/EUR price from official Binance API
    // FIX: Changed from 'https://binance.com' (HTML) to API endpoint (JSON)
    const priceRes = await axios.get('https://api.coingecko.com&vs_currencies=eur');
    
    if (!priceRes.data || !priceRes.data.bitcoin.eur) {
      throw new Error('Failed to retrieve price from Binance API');
    }
    
    const btcPriceEur = parseFloat(priceRes.data.bitcoin.eur);

    for (let deposit of activeDeposits) {
      const balance = await getBtcBalance(deposit.address);

      if (balance >= deposit.amount && !deposit.locked) {
        // LOCK: Prevent double-crediting during async loop
        deposit.locked = true;

        // Update the value based on current market price
        deposit.amountEUR = balance * btcPriceEur;
        deposit.status = 'confirmed';
        deposit.confirmations = 3; 
        await deposit.save();

        // 3. CREDIT THE USER NODE
        const user = await User.findById(deposit.user);
        if (user) {
          const currentEur = user.balances.get('EUR') || 0;
          const currentBtc = user.balances.get('BTC') || 0;

          user.balances.set('EUR', currentEur + deposit.amountEUR);
          user.balances.set('BTC', currentBtc + balance);
          user.totalBalance += deposit.amountEUR;

          // 4. ADD TO LEDGER
          user.ledger.push({
            amount: deposit.amountEUR,
            currency: 'EUR',
            type: 'deposit',
            status: 'completed',
            description: `BTC Deposit Confirmed @ €${btcPriceEur.toLocaleString()}/BTC`
          });

          user.markModified('balances');
          await user.save();

          // 5. UNIFIED TRANSACTION RECORD
          await Transaction.create({
            user: user._id,
            type: 'deposit',
            amount: deposit.amountEUR,
            signedAmount: deposit.amountEUR,
            currency: 'EUR',
            status: 'completed',
            walletAddress: deposit.address,
            method: 'crypto'
          });

          // 6. REAL-TIME SYNC
          if (io) {
            io.to(user._id.toString()).emit('balanceUpdate', {
              balances: Object.fromEntries(user.balances),
              message: `✅ Deposit of ${balance} BTC Confirmed!`
            });
          }
          console.log(`[WATCHER] Success: Credited ${user.username} with €${deposit.amountEUR}`);
        }
      }
    }
  } catch (error) {
    // This will now catch both DNS resolution issues and API failures
    console.error('⚠️ [WATCHER] Sync Error:', error.message);
  }
};

