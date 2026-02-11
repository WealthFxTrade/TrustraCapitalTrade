import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { getBTCPriceEUR } from '../services/btcPriceService.js';

/**

@desc    Get User Dashboard Overview

@route   GET /api/user/dashboard

@access  Private (JWT)
*/
export const getUserDashboard = async (req, res, next) => {
try {
// 1. Fetch user data (using req.user.id from your JWT middleware)
const user = await User.findById(req.user.id)
.select('balances ledger plan isPlanActive planROI')
.lean();

if (!user) throw new ApiError(404, 'User not found');

/* -----------------------------
Normalize balances (Map-safe)
------------------------------ */
const balances =
user.balances instanceof Map
? Object.fromEntries(user.balances)
: user.balances || {};

const eurBalance = Number(balances.EUR || 0);

/* -----------------------------
Ledger Calculations (Profit/Deposits/Withdrawals)
------------------------------ */
const ledger = user.ledger || [];

const totalProfit = ledger
.filter((l) => ['roi_profit', 'interest', 'referral_bonus'].includes(l.type))
.reduce((sum, l) => sum + Number(l.amount || 0), 0);

const totalDeposits = ledger
.filter((l) => l.type === 'deposit' && l.status === 'completed')
.reduce((sum, l) => sum + Number(l.amount || 0), 0);

const totalWithdrawals = ledger
.filter((l) => l.type === 'withdrawal' && l.status === 'completed')
.reduce((sum, l) => sum + Number(l.amount || 0), 0);

/* -----------------------------
Live BTC Pricing (CoinGecko Integration)
------------------------------ */
const btcPriceEUR = await getBTCPriceEUR();
const btcEquivalent = btcPriceEUR > 0 ? eurBalance / btcPriceEUR : 0;

/* -----------------------------
FIXED: Production Response Keys
Matches Dashboard.jsx: setStats(res.data.stats)
------------------------------ */
res.json({
success: true,
currency: 'EUR',
stats: {
// 🔥 CRITICAL: These keys must match your Dashboard.jsx state
mainBalance: eurBalance,
totalProfit: Number(totalProfit.toFixed(2)),
activePlan: user.isPlanActive ? user.plan : 'No Active Plan',

// Secondary stats for other UI components  
 balanceBTC: Number(btcEquivalent.toFixed(8)),  
 totalDeposits: Number(totalDeposits.toFixed(2)),  
 totalWithdrawals: Number(totalWithdrawals.toFixed(2)),  
 dailyROI: user.isPlanActive ? user.planROI : 0,

},
market: {
btcPriceEUR,
refreshedAt: new Date().toISOString(),
},
// Send recent transactions for the dashboard list
transactions: ledger.slice(-5).reverse()
});
} catch (err) {
next(err);
}
};
