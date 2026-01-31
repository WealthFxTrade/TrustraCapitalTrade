// backend/jobs/depositWatcher.js
import cron from 'node-cron';
import Deposit from '../models/Deposit.js';
import { confirmDeposit } from '../services/confirmDeposit.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

// Batch & concurrency
const BATCH_SIZE = 50;
const CONCURRENCY = 5;
const CONFIRMATIONS_REQUIRED = 3;

async function processDeposit(deposit) {
  try {
    const confirmations = await getBtcTxConfirmations(deposit.txHash);
    if (confirmations === null) return; // tx not yet seen

    deposit.confirmations = confirmations;
    await deposit.save();

    if (confirmations >= CONFIRMATIONS_REQUIRED && deposit.status !== 'confirmed') {
      await confirmDeposit(deposit._id);
      console.log(`[DepositWatcher] Confirmed: ${deposit._id}`);
    } else {
      console.log(`[DepositWatcher] Deposit ${deposit._id} has ${confirmations} confirmations`);
    }
  } catch (err) {
    console.error(`[DepositWatcher] Error processing ${deposit._id}:`, err);
  }
}

async function processDepositsInBatches(deposits) {
  for (let i = 0; i < deposits.length; i += CONCURRENCY) {
    const batch = deposits.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(processDeposit));
  }
}

// Horizontally safe: claim deposits using an atomic "lock"
async function fetchPendingDeposits(batchSize = BATCH_SIZE) {
  const deposits = [];
  for (let i = 0; i < batchSize; i++) {
    const deposit = await Deposit.findOneAndUpdate(
      {
        status: { $in: ['pending', 'confirming'] },
        txHash: { $exists: true, $ne: null },
        locked: { $ne: true },
      },
      { $set: { locked: true } },
      { new: true }
    );

    if (!deposit) break;
    deposits.push(deposit);
  }
  return deposits;
}

cron.schedule('* * * * *', async () => {
  console.log(`[DepositWatcher] Running at ${new Date().toISOString()}`);

  try {
    const deposits = await fetchPendingDeposits(BATCH_SIZE);
    if (!deposits.length) {
      console.log('[DepositWatcher] No pending deposits');
      return;
    }

    await processDepositsInBatches(deposits);

    // Release locks after processing
    await Deposit.updateMany(
      { _id: { $in: deposits.map(d => d._id) } },
      { $unset: { locked: '' } }
    );
  } catch (err) {
    console.error('[DepositWatcher] Failed:', err);
  }
});
