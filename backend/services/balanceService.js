import LedgerEntry from '../models/LedgerEntry.js';
import mongoose from 'mongoose';
import { getEthBalance, getUsdtBalance } from '../utils/ethUtils.js';

/**
 * Internal ledger balance (unchanged)
 */
export async function getUserBalance(userId, currency) {
  const result = await LedgerEntry.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        currency,
      },
    },
    {
      $group: {
        _id: '$currency',
        balance: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'credit'] },
              '$amount',
              { $multiply: ['$amount', -1] },
            ],
          },
        },
      },
    },
  ]);

  return result.length ? Number(result[0].balance) : 0;
}

/**
 * SAFE Blockchain Balance Checker (Prevents malformed warnings)
 */
export async function getBlockchainBalances(address) {
  if (!address) {
    console.warn('⚠️ [BLOCKCHAIN BALANCE] No address provided');
    return { eth: '0.0', usdt: '0.0' };
  }

  const [ethResult, usdtResult] = await Promise.allSettled([
    getEthBalance(address),
    getUsdtBalance(address)
  ]);

  const eth = ethResult.status === 'fulfilled' ? ethResult.value : '0.0';
  const usdt = usdtResult.status === 'fulfilled' ? usdtResult.value : '0.0';

  if (ethResult.status === 'rejected' || usdtResult.status === 'rejected') {
    console.warn(`⚠️ [BLOCKCHAIN BALANCE WARN] \( {address} | ETH: \){eth} | USDT: ${usdt}`);
  }

  return { eth, usdt };
}

export { getEthBalance, getUsdtBalance };
