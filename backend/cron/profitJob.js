import cron from 'node-cron';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Run every midnight (00:00) - adjust as needed
cron.schedule('0 0 * * *', async () => {
  console.log('--- 🕒 Starting Daily Profit Distribution ---');
  
  try {
    // 1. Fetch only active investors to save memory
    const activeInvestors = await User.find({ 
      isPlanActive: true, 
      banned: false,
      "activePlan.amount": { $gt: 0 } 
    });

    if (activeInvestors.length === 0) {
      return console.log('ℹ️ No active plans found for profit distribution.');
    }

    const results = await Promise.allSettled(activeInvestors.map(async (user) => {
      // 2. Calculate daily ROI (example: 1% daily)
      const dailyRate = user.activePlan.dailyROI || 0.01; 
      const profit = user.activePlan.amount * dailyRate;
      
      const currency = user.activePlan.currency || 'EUR';
      const currentBalance = user.balances.get(currency) || 0;
      const newBalance = currentBalance + profit;

      // 3. Atomic Update
      user.balances.set(currency, newBalance);
      
      // 4. Record in Ledger
      user.ledger.push({
        amount: profit,
        currency,
        type: 'profit',
        status: 'completed',
        description: `Daily ROI: ${user.activePlan.name} (${(dailyRate * 100).toFixed(2)}%)`,
        createdAt: new Date()
      });

      user.markModified('balances');
      return await user.save();
    }));

    // 5. Global Audit Log for the Cron Run
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    await AuditLog.create({
      action: 'CRON_PROFIT_DISTRIBUTION',
      metadata: { 
        totalProcessed: activeInvestors.length, 
        success: successCount,
        timestamp: new Date()
      }
    });

    console.log(`✅ Profit Distribution Complete: ${successCount} users credited.`);
  } catch (err) {
    console.error('❌ CRON FATAL ERROR:', err.message);
  }
});

