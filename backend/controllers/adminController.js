import User from '../models/User.js';

/**
 * GET /api/admin/stats
 * Fetches global platform metrics for the Admin Dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $facet: {
          // 1. Sum up all EUR balances from the Map
          totalLiquidity: [
            { $project: { eurBalance: { $ifNull: ["$balances.EUR", 0] } } },
            { $group: { _id: null, total: { $sum: "$eurBalance" } } }
          ],
          // 2. Sum up all Active (running) Investment amounts
          activeInvestments: [
            { $unwind: { path: "$investments", preserveNullAndEmptyArrays: false } },
            { $match: { "investments.status": "running" } },
            { $group: { _id: null, total: { $sum: "$investments.amount" }, count: { $sum: 1 } } }
          ],
          // 3. User activity counts
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

    // Format the aggregated data into a clean object
    const result = {
      totalLiquidity: stats[0].totalLiquidity[0]?.total || 0,
      activeInvestmentVolume: stats[0].activeInvestments[0]?.total || 0,
      activeInvestmentCount: stats[0].activeInvestments[0]?.count || 0,
      totalUsers: stats[0].userStats[0]?.totalUsers || 0,
      usersWithActivePlans: stats[0].userStats[0]?.activePlans || 0
    };

    res.json({ success: true, stats: result });
  } catch (err) {
    console.error("❌ Admin Stats Error:", err.message);
    res.status(500).json({ success: false, message: "Internal synchronization error" });
  }
};

