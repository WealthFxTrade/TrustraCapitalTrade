import LedgerEntry from '../models/LedgerEntry.js';
import mongoose from 'mongoose';

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
