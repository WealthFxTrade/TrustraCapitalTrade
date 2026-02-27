// backend/cron/dailyRioProfit.js - Audit Certified v8.4.1
import cron from 'node-cron';
import Investment from '../models/Investment.js';
import PLAN_DATA from '../config/plans.js'; // Ensure this path is correct

/**
 * Daily ROI Review Cron (Audit / Compliance Mode)
 * Runs at 00:00 every day to log theoretical performance.
 * NO balance modifications occur in this cycle.
 */
cron.schedule('0 0 * * *', async () => {
  console.log('🕒 [AUDIT] Starting daily ROI review cycle...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let reviewed = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // 1. Fetch active nodes with investor details
    const activeInvestments = await Investment.find({ status: 'active' })
      .populate('user', 'email fullName')
      .lean();

    console.log(`[AUDIT] Analyzing ${activeInvestments.length} active nodes.`);

    for (const plan of activeInvestments) {
      // 2. Check for double-processing
      const lastReviewed = plan.lastReturnUpdate
        ? new Date(plan.lastReturnUpdate).setHours(0, 0, 0, 0)
        : null;

      if (lastReviewed === today.getTime()) {
        skipped++;
        continue;
      }

      // 3. Map to Plan Config
      const config = PLAN_DATA[plan.planKey];
      if (!config) {
        console.warn(`[AUDIT] Missing config for Tier: ${plan.planKey} (Investor: ${plan.user?.email})`);
        errors++;
        continue;
      }

      // 4. Calculate Theoretical Yield
      // Example: €1000 * 0.004 (0.4% daily) = €4.00
      const theoreticalDaily = plan.amount * (config.dailyROI || 0);

      if (theoreticalDaily > 0) {
        console.log(
          `[LOG] Investor: ${plan.user?.email} | ` +
          `Tier: ${plan.planName} | ` +
          `Capital: €${plan.amount.toFixed(2)} | ` +
          `Theoretical Yield: €${theoreticalDaily.toFixed(2)}`
        );
        reviewed++;
      }
    }

    console.log(
      `[AUDIT] Review complete: ${reviewed} processed, ` +
      `${skipped} skipped, ${errors} configuration errors.`
    );
  } catch (err) {
    console.error('❌ [CRITICAL] ROI Review failed:', err.message);
  }
});

