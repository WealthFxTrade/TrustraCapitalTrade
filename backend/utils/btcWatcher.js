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

    // 2. FIX: Correct CoinGecko API URL and parameters
    // Old URL was missing the endpoint path and used '&' instead of '?'
    const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
    
    if (!priceRes.data || !priceRes.data.bitcoin || !priceRes.data.bitcoin.eur) {
      throw new Error('Failed to retrieve price from CoinGecko API');
    }
    
    const btcPriceEur = parseFloat(priceRes.data.bitcoin.eur);

    for (let deposit of activeDeposits) {
      // Logic to fetch balance from blockchain (ensure bitcoinUtils is working)
      const balance = await getBtcBalance(deposit.address);

      // Check if deposit met or exceeded the expected amount
      if (balance >= deposit.amount && !deposit.locked) {
        
        // LOCK: Prevent double-crediting during async loop
        deposit.locked = true;
        deposit.amountBTC = balance; // Ensure we store actual received amount
        deposit.amountEUR = balance * btcPriceEur;
        deposit.status = 'confirmed';
        deposit.confirmations = 3;
        await deposit.save();

        // 3. CREDIT THE USER
        const user = await User.findById(deposit.user);
        
        if (user) {
          // Initialize balances if they don't exist
          if (!user.balances) user.balances = new Map();

          const currentEur = user.balances.get('EUR') || 0;
          const currentBtc = user.balances.get('BTC') || 0;

          // Update Map values
          user.balances.set('EUR', currentEur + deposit.amountEUR);
          user.balances.set('BTC', currentBtc + balance);
          
          // Increment total balance
          user.totalBalance = (user.totalBalance || 0) + deposit.amountEUR;

          // 4. ADD TO LEDGER
          user.ledger.push({
            amount: deposit.amountEUR,
            currency: 'EUR',
            type: 'deposit',
            status: 'completed',
            description: `BTC Deposit Confirmed @ €${btcPriceEur.toLocaleString()}/BTC`
          });

          // CRITICAL: Mark Map as modified for Mongoose
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

          // 6. REAL-TIME SYNC VIA SOCKET.IO
          if (io) {
            // Convert Map to Object for JSON emission
            const balanceObj = Object.fromEntries(user.balances);
            
            io.to(user._id.toString()).emit('balanceUpdate', {
              balances: balanceObj,
              totalBalance: user.totalBalance,
              message: `✅ Deposit of ${balance} BTC Confirmed!`
            });
          }

          console.log(`[WATCHER] Success: Credited ${user.username} with €${deposit.amountEUR.toFixed(2)}`);
        }
      }
    }
  } catch (error) {
    console.error('⚠️ [WATCHER] Sync Error:', error.message);
  }
};
