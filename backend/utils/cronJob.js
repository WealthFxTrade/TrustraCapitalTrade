import cron from 'node-cron';
import User from '../models/User.js';

// Define the rates here to match your plan.js logic
const RIO_RATES = {
  'Rio Starter': 0.003,
  'Rio Basic': 0.004,
  'Rio Standard': 0.005,
  'Rio Advanced': 0.006,
  'Rio Elite': 0.008
};

const initCronJobs = () => {
  /**
   * Daily Profit Distribution
   * Runs every day at 00:00 (Midnight)
   */
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [CRON] Starting daily profit distribution...');
    
    try {
      // 1. Find all users with an active plan
      const activeUsers = await User.find({ isPlanActive: true });

      if (activeUsers.length === 0) {
        return console.log('🕒 [CRON] No active investments found.');
      }

      for (let user of activeUsers) {
        // 2. Identify the daily rate based on the user's plan name
        const rate = RIO_RATES[user.plan] || 0;
        
        if (rate > 0) {
          // 3. Calculate profit based on total amount invested (from ledger) 
          // or a specific 'activeInvestment' field. 
          // For simplicity, we calculate profit based on their last investment entry:
          const lastInvestment = user.ledger
            .filter(entry => entry.type === 'investment')
            .pop();

          if (lastInvestment) {
            const dailyProfit = lastInvestment.amount * rate;
            const currentEur = user.balances.get('EUR') || 0;

            // 4. Update EUR balance and add entry to ledger
            user.balances.set('EUR', currentEur + dailyProfit);
            
            user.ledger.push({
              amount: dailyProfit,
              currency: 'EUR',
              type: 'profit',
              status: 'completed',
              description: `Daily profit from ${user.plan}`,
              createdAt: new Date()
            });

            await user.save();
          }
        }
      }
      console.log(`✅ [CRON] Distributed profits to ${activeUsers.length} users.`);
    } catch (err) {
      console.error('❌ [CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

