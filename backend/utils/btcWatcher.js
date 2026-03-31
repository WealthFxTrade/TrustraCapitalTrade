import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

/**
 * Fetch BTC balance in BTC from public explorer
 */
const fetchBlockchainBalance = async (address) => {
  try {
    const { data } = await axios.get(`https://blockchain.info{address}`);
    return data.final_balance / 100000000; // Satoshis to BTC
  } catch (err) {
    console.error(`[BTC API ERROR] Address ${address}:`, err.message);
    return null;
  }
};

export const watchBtcDeposits = async (io) => {
  try {
    // 1. Get all users with BTC addresses
    const users = await User.find({ "balances.BTC_ADDRESS": { $exists: true } });
    if (users.length === 0) return;

    // 2. Get current price
    const priceRes = await axios.get('https://coingecko.com');
    const btcPriceEur = parseFloat(priceRes.data?.bitcoin?.eur) || 0;

    for (const user of users) {
      const userBtcAddress = user.balances.get('BTC_ADDRESS');
      const blockchainBalance = await fetchBlockchainBalance(userBtcAddress);

      if (blockchainBalance === null) continue;

      const currentStoredBtc = user.balances.get('BTC') || 0;

      // 3. Check for new deposits
      if (blockchainBalance > currentStoredBtc) {
        const depositAmountBtc = blockchainBalance - currentStoredBtc;
        const depositAmountEur = depositAmountBtc * btcPriceEur;

        // 4. Update User Balances (EUR + BTC)
        user.balances.set('BTC', Number(blockchainBalance.toFixed(8)));
        const currentEur = user.balances.get('EUR') || 0;
        user.balances.set('EUR', Number((currentEur + depositAmountEur).toFixed(2)));

        // 5. Create Transaction Record (Matches your Transaction.js schema)
        await Transaction.create({
          user: user._id,
          type: 'deposit',
          amount: depositAmountEur,
          currency: 'EUR',
          signedAmount: depositAmountEur, // Pre-validate hook will also handle this
          status: 'completed',
          method: 'crypto',
          walletAddress: userBtcAddress,
          txHash: `AUTO-SYNC-${Date.now()}`, 
          description: `Blockchain Auto-Sync: ${depositAmountBtc.toFixed(8)} BTC detected`
        });

        user.markModified('balances');
        await user.save();

        // 6. Socket.io Notification
        if (io) {
          io.to(user._id.toString()).emit('balanceUpdate', {
            balances: Object.fromEntries(user.balances),
            message: `✅ Assets Vaulted: +${depositAmountBtc.toFixed(8)} BTC (~€${depositAmountEur.toFixed(2)})`
          });
        }

        console.log(`[WATCHER] 💰 Credited ${user.email}: €${depositAmountEur.toFixed(2)}`);
      }
    }
  } catch (error) {
    console.error('⚠️ [BTC WATCHER ERROR]:', error.message);
  }
};

