// backend/cron/dailyRioProfit.js (SAFE / AUDIT-ONLY VERSION)
// This cron job now ONLY reviews and logs theoretical daily yields — NO balances are modified.

import cron from 'node-cron';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import AuditLog from '../models/AuditLog.js'; // optional — for audit trail

/**
 * Daily ROI Review Cron (Audit / Demo Mode)
 * - Runs at midnight every day
 * - Calculates theoretical daily profit for active plans
 * - Logs results only — does NOT credit any balances
 * - Can be extended later for real external yield sources (staking, trading, etc.)
 */
cron.schedule('0 0 * * *', async () => {
  console.log('🕒 Starting daily ROI review (AUDIT MODE - no balance changes)');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let reviewed = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Find all active investments
    const activePlans = await Investment.find({ status: 'active' })
      .populate('user', 'email fullName')
      .lean(); // faster read-only query

    console.log(`Found ${activePlans.length} active investment plans`);

    for (const plan of activePlans) {
      // Skip if already reviewed today (double-processing protection)
      const lastReviewed = plan.lastRoiAt
        ? new Date(plan.lastRoiAt).setHours(0, 0, 0, 0)
        : null;

      if (lastReviewed === today.getTime()) {
        skipped++;
        continue;
      }

      // Get plan config (assuming PLAN_DATA is imported or available)
      const planConfig = PLAN_DATA?.[plan.planKey || plan.planName];
      if (!planConfig) {
        console.warn(`No config found for plan \( {plan.planName || plan.planKey} (user: \){plan.user?.email})`);
        errors++;
        continue;
      }

      // Calculate theoretical daily profit (for logging only)
      const theoreticalDaily = plan.amount * planConfig.dailyROI;

      if (theoreticalDaily > 0) {
        console.log(
          `User: ${plan.user?.email || 'unknown'} | ` +
          `Plan: ${plan.planName} | ` +
          `Invested: €${plan.amount.toFixed(2)} | ` +
          `Theoretical daily yield: €${theoreticalDaily.toFixed(2)}`
        );

        // Optional: Log for admin audit trail
        await AuditLog.create({
          admin: null, // system cron
          action: 'roi_review',
          target: plan.user?._id,
          details: {
            investmentId: plan._id,
            planName: plan.planName,
            investedAmount: plan.amount,
            theoreticalDaily,
            lastRoiAt: plan.lastRoiAt,
            userEmail: plan.user?.email,
          },
        });

        reviewed++;
      }
    }

    console.log(
      `Daily ROI review complete: ${reviewed} plans reviewed, ` +
      `\( {skipped} skipped (already processed today), \){errors} errors`
    );
  } catch (err) {
    console.error('Daily ROI review failed:', err.message);
  }
});
