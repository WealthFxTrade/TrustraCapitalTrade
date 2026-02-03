// backend/jobs/depositWatcher.js
import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import { confirmDeposit } from '../services/confirmDeposit.js';
import { getBtcTxConfirmations } from '../utils/bitcoinUtils.js';

// Settings
const BATCH_SIZE = 50;
const CONCURRENCY = 5;
const CONFIRMATIONS_REQUIRED = 3;

async function processDeposit(transaction) {
  try {
    const confirmations = await getBtcTxConfirmations(transaction.txHash);
    if (confirmations === null) return; // tx not yet seen

    transaction.confirmations = confirmations;
    await transaction.save();

    if (confirmations >= CONFIRMATIONS_REQUIRED && transaction.status !== 'completed') {
      await confirmDeposit(transaction._id);
      console.log(`[DepositWatcher] Confirmed: \( {transaction._id} ( \){transaction.txHash})`);
    } else {
      console.log(`[DepositWatcher] Transaction \( {transaction._id} has \){confirmations} confirmations`);
    }
  } catch (err) {
    console.error(`[DepositWatcher] Error processing ${transaction._id}:`, err.message);
  }
}

async function processDepositsInBatches(transactions) {
  for (let i = 0; i < transactions.length; i += CONCURRENCY) {
    const batch = transactions.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(processDeposit));
  }
}

async function fetchPendingDeposits(batchSize = BATCH_SIZE) {
  const transactions = [];
  for (let i = 0; i < batchSize; i++) {
    const transaction = await Transaction.findOneAndUpdate(
      {
        type: 'deposit',
        status: { $in: ['pending', 'confirming'] },
        txHash: { $exists: true, $ne: null },
        locked: { $ne: true },
      },
      { $set: { locked: true } },
      { new: true, sort: { createdAt: 1 } } // oldest first
    );

    if (!transaction) break;
    transactions.push(transaction);
  }
  return transactions;
}

cron.schedule('* * * * *', async () => {
  console.log(`[DepositWatcher] Running at ${new Date().toISOString()}`);

  try {
    const transactions = await fetchPendingDeposits(BATCH_SIZE);
    if (!transactions.length) {
      console.log('[DepositWatcher] No pending deposits');
      return;
    }

    console.log(`[DepositWatcher] Found ${transactions.length} pending deposits`);

    await processDepositsInBatches(transactions);

    // Release locks
    await Transaction.updateMany(
      { _id: { $in: transactions.map(t => t._id) } },
      { $unset: { locked: '' } }
    );

    console.log('[DepositWatcher] Batch completed successfully');
  } catch (err) {
    console.error('[DepositWatcher] Cron job failed:', err.message, err.stack);
  }
});
