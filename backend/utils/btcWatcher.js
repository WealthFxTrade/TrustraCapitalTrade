// utils/btcWatcher.js - FULLY CORRECTED & UNSHORTENED VERSION
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
    const activeDeposits = await Deposit.find({
      status: { $in: ['pending', 'confirming'] },
      currency: 'BTC'
    }).populate('user');

    if (activeDeposits.length === 0) return;

    // Get current BTC price in EUR
    const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
    const btcPriceEur = parseFloat(priceRes.data?.bitcoin?.eur) || 0;

    for (const deposit of activeDeposits) {
      const receivedBtc = await getBtcBalance(deposit.address);

      if (receivedBtc >= (deposit.expectedAmount || 0.00005) && !deposit.locked) {

        // Lock deposit to prevent double crediting
        deposit.locked = true;
        deposit.amountBTC = receivedBtc;
        deposit.amountEUR = receivedBtc * btcPriceEur;
        deposit.status = 'confirmed';
        deposit.confirmations = 6;
        await deposit.save();

        const user = deposit.user;
        if (!user) continue;

        // Update user balances safely
        if (!user.balances) user.balances = new Map();

        const currentEUR = user.balances.get('EUR') || 0;
        const currentBTC = user.balances.get('BTC') || 0;

        user.balances.set('EUR', currentEUR + deposit.amountEUR);
        user.balances.set('BTC', currentBTC + receivedBtc);

        user.totalBalance = (user.totalBalance || 0) + deposit.amountEUR;
        user.realizedProfit = (user.realizedProfit || 0) + deposit.amountEUR;

        // Add to user ledger
        user.ledger.push({
          amount: deposit.amountEUR,
          currency: 'EUR',
          type: 'deposit',
          status: 'completed',
          address: deposit.address,
          description: `BTC Deposit Confirmed (${receivedBtc.toFixed(8)} BTC)`,
          createdAt: new Date()
        });

        user.markModified('balances');
        user.markModified('ledger');
        await user.save();

        // Create unified transaction record
        await Transaction.create({
          user: user._id,
          type: 'deposit',
          amount: deposit.amountEUR,
          signedAmount: deposit.amountEUR,
          currency: 'EUR',
          status: 'completed',
          method: 'BTC',
          walletAddress: deposit.address,
          description: `BTC Deposit - ${receivedBtc.toFixed(8)} BTC`
        });

        // Real-time updates via Socket.IO
        if (io) {
          io.to(user._id.toString()).emit('balanceUpdate', {
            totalBalance: user.totalBalance,
            realizedProfit: user.realizedProfit,
            balances: Object.fromEntries(user.balances),
            message: `✅ ${receivedBtc.toFixed(8)} BTC Deposit Confirmed!`
          });

          io.to(user._id.toString()).emit('ledgerUpdate', {
            ledger: user.ledger.slice(-10)
          });
        }

        console.log(`[WATCHER] ✅ Credited \( {user.username || user._id} with € \){deposit.amountEUR.toFixed(2)}`);
      }
    }
  } catch (error) {
    console.error('⚠️ [BTC WATCHER ERROR]', error.message);
  }
};
