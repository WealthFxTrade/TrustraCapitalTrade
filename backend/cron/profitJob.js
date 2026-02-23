import cron from 'node-cron';
import User from '../models/User.js';

/**
 * Trustra Capital - Rio Series 2026 Profit Engine
 * Runs at 00:00 Daily to credit Profit Wallets
 */
cron.schedule('0 0 * * *', async () => {
  const startTime = new Date();
  console.log(`--- 🕒 [${startTime.toISOString()}] Starting Rio ROI Distribution ---`);

  try {
    // 1. Fetch only verified, active investors using the schema fields we fixed
    const activeInvestors = await User.find({
      isPlanActive: true,
      banned: false,
      investedAmount: { $gt: 0 },
      isCounter: { $ne: true } // Safety: skip the system counter doc
    });

    if (activeInvestors.length === 0) {
      return console.log('ℹ️ No active investment nodes found for distribution.');
    }

    let successCount = 0;

    // Use a loop for better error isolation per user
    for (const user of activeInvestors) {
      try {
        // 2. Calculate daily ROI based on the schema fields
        // dailyRoiRate is already synced in the User model pre-save hook
        const dailyRate = user.dailyRoiRate || 0;
        const profit = Number((user.investedAmount * dailyRate).toFixed(2));

        if (profit <= 0) continue;

        // 3. Update the PROFIT wallet (Mongoose Map Logic)
        const profitWalletKey = 'EUR_PROFIT';
        const currentProfit = user.balances.get(profitWalletKey) || 0;
        user.balances.set(profitWalletKey, Number((currentProfit + profit).toFixed(2)));

        // 4. Update the Ledger
        user.ledger.push({
          amount: profit,
          currency: 'EUR',
          type: 'roi_profit',
          status: 'completed',
          description: `Daily ROI Drop: ${user.plan.toUpperCase()} (${(dailyRate * 100).toFixed(2)}%)`,
          createdAt: new Date()
        });

        // 5. Track Plan Duration & Expiry
        user.planDaysServed = (user.planDaysServed || 0) + 1;
        user.lastProfitDate = new Date();

        // 6. Auto-Expiry Logic
        if (user.planDaysServed >= (user.planDuration || 30)) {
          console.log(`📉 Plan Expired for ${user.email}. Moving principal to EUR wallet.`);

          // Return principal to main EUR wallet
          const mainEur = user.balances.get('EUR') || 0;
          user.balances.set('EUR', mainEur + user.investedAmount);

          // Reset Investment Status
          user.isPlanActive = false;
          user.investedAmount = 0;
          user.plan = 'none';
          user.planDaysServed = 0;
        }

        // 7. Save (Triggers pre-save hook for final consistency)
        await user.save();
        successCount++;
      } catch (userErr) {
        console.error(`❌ ROI Failed for ${user.email}:`, userErr.message);
      }
    }

    console.log(`✅ Rio Distribution Complete: ${successCount}/${activeInvestors.length} nodes credited.`);
  } catch (err) {
    console.error('❌ CRON FATAL ERROR:', err.message);
  }
});

