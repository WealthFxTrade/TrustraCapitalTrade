import User from '../models/User.js';

/**
 * @desc    Get Global Platform Metrics (Trustra 2026 Standard)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $facet: {
          // 1. Correctly extract EUR from the balances Map
          totalLiquidity: [
            {
              $project: {
                // Convert Map to Array to access the EUR key
                balanceArray: { $objectToArray: "$balances" }
              }
            },
            { $unwind: "$balanceArray" },
            { $match: { "balanceArray.k": "EUR" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$balanceArray.v" }
              }
            }
          ],

          // 2. Sum up Active Investment Volume
          activeInvestments: [
            { $unwind: "$investments" },
            { $match: { "investments.status": "active" } }, // Matches your 2026 schema 'active'
            {
              $group: {
                _id: null,
                total: { $sum: "$investments.amount" },
                count: { $sum: 1 }
              }
            }
          ],

          // 3. User activity and Plan counts
          userStats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activePlans: { $sum: { $cond: ["$isPlanActive", 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    // Format the aggregated data into a clean production-ready object
    const result = {
      totalLiquidity: stats[0].totalLiquidity[0]?.total || 0,
      activeInvestmentVolume: stats[0].activeInvestments[0]?.total || 0,
      activeInvestmentCount: stats[0].activeInvestments[0]?.count || 0,
      totalUsers: stats[0].userStats[0]?.totalUsers || 0,
      usersWithActivePlans: stats[0].userStats[0]?.activePlans || 0,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({ 
      success: true, 
      stats: result 
    });

  } catch (err) {
    console.error("❌ [TRUSTRA_STATS_ERROR]:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Node synchronization error: Failed to aggregate global metrics." 
    });
  }
};

