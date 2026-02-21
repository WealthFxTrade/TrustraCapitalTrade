import cron from 'node-cron';
import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import { getBtcBalance } from '../utils/bitcoinUtils.js';
import { getEthBalance, getUsdtBalance } from '../utils/ethUtils.js';

// 🔒 Lock to prevent overlapping cron jobs
let isScanning = false;

/**
 * 🤖 Multi-Currency Deposit Scanner
 * Synchronizes blockchain deposits with user balances
 */
export const scanDeposits = async () => {
  if (isScanning) {
    console.log('⚠️ [SCANNER] Previous scan still in progress. Skipping this cycle...');
    return;
  }

  isScanning = true;
  console.log('--- [SCANNER] Starting Multi-Currency Audit ---');

  try {
    // 1️⃣ Fetch pending deposits (Limit to 20 per batch to prevent RPC rate limits)
    const pendingDeposits = await Deposit.find({ status: 'pending' }).limit(20).lean();
    
    if (!pendingDeposits || pendingDeposits.length === 0) {
      console.log('ℹ️ [SCANNER] No pending deposits to check.');
      isScanning = false;
      return;
    }

    for (const deposit of pendingDeposits) {
      try {
        console.log(`🔍 Checking ${deposit.currency} at ${deposit.address}`);

        let actualBalance = 0;

        // 2️⃣ Blockchain verification
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
            console.warn(`❌ [SCANNER] Unsupported currency: ${deposit.currency}`);
            continue;
        }

        // 3️⃣ Verify if balance meets or exceeds expected amount
        if (actualBalance >= deposit.amount) {
          console.log(`✅ [MATCH] ${actualBalance} ${deposit.currency} found for ID: ${deposit._id}`);

          // 4️⃣ Atomic Update (Find user first)
          const user = await User.findById(deposit.user);
          if (!user) {
            console.error(`❌ [SCANNER] User ${deposit.user} not found for deposit ${deposit._id}`);
            continue;
          }

          // Credit User Balance (Assuming Balance is stored in EUR/USD)
          user.balance = (user.balance || 0) + deposit.amountEUR;
          await user.save();

          // Mark Deposit as Confirmed
          await Deposit.findByIdAndUpdate(deposit._id, {
            status: 'confirmed',
            confirmedAt: new Date(),
            onChainBalance: actualBalance // Log what was actually found
          });

          console.log(`💰 [CREDIT] €${deposit.amountEUR} added to ${user.email}`);
        } else {
          console.log(`⏳ [PENDING] ${actualBalance}/${deposit.amount} ${deposit.currency} received.`);
        }
      } catch (itemError) {
        console.error(`❌ [SCANNER] Error processing deposit ${deposit._id}:`, itemError.message);
      }
    }
  } catch (err) {
    console.error('🛑 [SCANNER_CRITICAL_ERROR]', err);
  } finally {
    isScanning = false; // Always release the lock
    console.log('--- [SCANNER] Audit Cycle Complete ---');
  }
};

// ⏱ Schedule: Every 5 minutes
// Using '*/5 * * * *' ensures it runs exactly every 5 mins
cron.schedule('*/5 * * * *', () => {
  scanDeposits();
});

export default scanDeposits;

