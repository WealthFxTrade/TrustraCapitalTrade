// controllers/adminDashboardController.js  (or wherever you keep admin stats)
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import Kyc from '../models/Kyc.js';

// Recommended: add these indexes if not already present
// User: { createdAt: -1 }
// Kyc: { status: 1 }
// Deposit: { status: 1, currency: 1 }
// Withdrawal: { status: 1, currency: 1 }

/**
 * GET /api/admin/stats
 * Returns key platform statistics for admin dashboard
 * Should be protected with admin-only middleware
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    verifiedUsers,          // useful metric
    kycStats,
    depositStats,
    withdrawalStats,
    pendingWithdrawals,
    pendingDeposits,        // added – often useful
  ] = await Promise.all([
    // Users
    User.countDocuments(),
    User.countDocuments({ isVerified: true, emailVerified: { $ne: null } }), // adjust fields to your schema

    // KYC
    Kyc.aggregate([
      {
        $facet: {
          pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
          approved: [{ $match: { status: 'approved' } }, { $count: 'count' }],
          rejected: [{ $match: { status: 'rejected' } }, { $count: 'count' }],
        },
      },
    ]),

    // Deposits – confirmed only, grouped by currency
    Deposit.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$receivedAmount' }, // use receivedAmount, not requested amount
          count: { $sum: 1 },
        },
      },
    ]),

    // Withdrawals – approved/sent
    Withdrawal.aggregate([
      { $match: { status: { $in: ['approved', 'sent', 'completed'] } } },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // Pending withdrawals (critical for admin attention)
    Withdrawal.countDocuments({ status: 'pending' }),

    // Pending deposits (also useful – stuck or manual review needed)
    Deposit.countDocuments({ status: { $in: ['pending', 'confirming'] } }),
  ]);

  // Transform KYC facet result
  const kyc = {
    pending: kycStats[0]?.pending[0]?.count || 0,
    approved: kycStats[0]?.approved[0]?.count || 0,
    rejected: kycStats[0]?.rejected[0]?.count || 0,
  };

  // Transform deposits & withdrawals into nice objects
  const depositsByCurrency = depositStats.reduce((acc, curr) => {
    acc[curr._id || 'BTC'] = {
      total: curr.totalAmount || 0,
      count: curr.count || 0,
    };
    return acc;
  }, {});

  const withdrawalsByCurrency = withdrawalStats.reduce((acc, curr) => {
    acc[curr._id || 'BTC'] = {
      total: curr.totalAmount || 0,
      count: curr.count || 0,
    };
    return acc;
  }, {});

  // Calculate platform BTC balance (simplified – assumes only BTC for now)
  const btcDeposited = depositsByCurrency.BTC?.total || 0;
  const btcWithdrawn = withdrawalsByCurrency.BTC?.total || 0;
  const btcBalance = btcDeposited - btcWithdrawn;

  res.status(200).json({
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        kyc: {
          pending: kyc.pending,
          approved: kyc.approved,
          rejected: kyc.rejected,
          pendingPercentage: totalUsers > 0 ? ((kyc.pending / totalUsers) * 100).toFixed(1) : 0,
        },
      },
      deposits: {
        byCurrency: depositsByCurrency,
        totalConfirmed: Object.values(depositsByCurrency).reduce((sum, v) => sum + v.total, 0),
        pending: pendingDeposits,
      },
      withdrawals: {
        byCurrency: withdrawalsByCurrency,
        totalProcessed: Object.values(withdrawalsByCurrency).reduce((sum, v) => sum + v.total, 0),
        pending: pendingWithdrawals,
      },
      platformBalance: {
        BTC: Number(btcBalance.toFixed(8)),
        // Add other currencies later when you support them
      },
    },
  });
});
