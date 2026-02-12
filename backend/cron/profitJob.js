import cron from 'node-cron';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Trustra Capital - Rio Series 2026 Profit Engine
 * Runs at 00:00 Daily to credit Profit Wallets
 */
cron.schedule('0 0 * * *', async () => {
  console.log('--- 🕒 Starting Rio Series ROI Distribution ---');

  try {
    // 1. Fetch only verified, active investors
    const activeInvestors = await User.find({
      isPlanActive: true,
      banned: false,
      "activePlan.amount": { $gt: 0 }
    });

    if (activeInvestors.length === 0) {
      return console.log('ℹ️ No active nodes found for distribution.');
    }

    const results = await Promise.allSettled(activeInvestors.map(async (user) => {
      // 2. Calculate daily ROI based on their specific plan rate
      const dailyRate = user.activePlan.dailyROI || 0.003; // Default 0.3% if not set
      const profit = Number((user.activePlan.amount * dailyRate).toFixed(2));

      // ✅ FIX: Target the PROFIT wallet specifically
      const profitWalletKey = 'EUR_PROFIT'; 
      const currentProfitBalance = user.balances.get(profitWalletKey) || 0;
      
      // 3. Update the Profit Balance
      user.balances.set(profitWalletKey, currentProfitBalance + profit);

      // 4. Update the User's Ledger for the Dashboard
      user.ledger.push({
        amount: profit,
        currency: 'EUR',
        type: 'profit',
        status: 'completed',
        description: `Daily ROI Drop: ${user.activePlan.name} (${(dailyRate * 100).toFixed(2)}%)`,
        createdAt: new Date()
      });

      // 5. Track Plan Duration (Optional: Auto-expire after X days)
      user.activePlan.daysServed = (user.activePlan.daysServed || 0) + 1;
      
      if (user.activePlan.daysServed >= user.activePlan.duration) {
        user.isPlanActive = false;
        user.activePlan.status = 'completed';
        // Logic to return principal to Main Wallet could go here
      }

      user.markModified('balances');
      user.markModified('ledger');
      user.markModified('activePlan');
      
      return await user.save();
    }));

    // 6. Global Security Audit
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    if (typeof AuditLog !== 'undefined') {
      await AuditLog.create({
        action: 'RIO_PROFIT_DISTRIBUTION',
        metadata: {
          totalProcessed: activeInvestors.length,
          success: successCount,
          node: 'Trustra_Main_v8',
          timestamp: new Date()
        }
      });
    }

    console.log(`✅ Rio Distribution Complete: ${successCount} profit wallets credited.`);
  } catch (err) {
    console.error('❌ CRON FATAL ERROR:', err.message);
  }
});

