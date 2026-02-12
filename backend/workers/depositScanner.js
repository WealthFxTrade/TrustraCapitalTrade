import cron from 'node-cron';
import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import { getBtcBalance } from '../utils/bitcoinUtils.js';
import { getEthBalance, getUsdtBalance } from '../utils/ethUtils.js'; // Create similar helpers for ETH/USDT

/**
 * 🤖 Multi-Currency Deposit Scanner
 * Runs every 5 minutes to synchronize blockchain deposits with user balances
 */
const scanDeposits = async () => {
  console.log('--- [SCANNER] Multi-Currency Blockchain Audit ---');

  try {
    // 1️⃣ Fetch all pending deposits
    const pendingDeposits = await Deposit.find({ status: 'pending' }).lean();
    if (!pendingDeposits.length) return console.log('No pending deposits found.');

    for (const deposit of pendingDeposits) {
      console.log(`Checking deposit ${deposit._id} at ${deposit.address} (${deposit.currency})`);

      let actualBalance = 0;

      // 2️⃣ Check blockchain depending on currency
      switch (deposit.currency) {
        case 'BTC':
          actualBalance = await getBtcBalance(deposit.address);
          break;
        case 'ETH':
          actualBalance = await getEthBalance(deposit.address);
          break;
        case 'USDT':
          actualBalance = await getUsdtBalance(deposit.address);
          break;
        default:
          console.warn(`[SCANNER] Unsupported currency ${deposit.currency} for deposit ${deposit._id}`);
          continue;
      }

      // 3️⃣ Compare on-chain balance with expected deposit
      if (actualBalance >= deposit.amount) {
        console.log(`✅ MATCH: ${actualBalance} ${deposit.currency} received for Deposit ${deposit._id}`);

        // 4️⃣ Atomic update: Credit User and Confirm Deposit
        const user = await User.findById(deposit.user);
        if (!user) {
          console.warn(`[SCANNER] User ${deposit.user} not found, skipping deposit ${deposit._id}`);
          continue;
        }

        user.balance = (user.balance || 0) + deposit.amountEUR; // Balance in EUR
        await user.save();

        await Deposit.findByIdAndUpdate(deposit._id, {
          status: 'confirmed',
          confirmedAt: new Date()
        });

        console.log(`💰 CREDIT: User ${user.email} credited €${deposit.amountEUR}`);
      } else {
        console.log(`⏳ Pending: ${actualBalance} ${deposit.currency} received for Deposit ${deposit._id}, waiting for full amount.`);
      }
    }
  } catch (err) {
    console.error('[SCANNER_CRITICAL_ERROR]', err);
  }
};

// ⏱ Schedule: Every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('[CRON] Running multi-currency deposit scanner...');
  scanDeposits();
});

export default scanDeposits;
