import cron from 'node-cron';
import User from '../models/User.js';

const RIO_RATES = {
  'Rio Starter': 0.003,
  'Rio Basic': 0.004,
  'Rio Standard': 0.005,
  'Rio Advanced': 0.006,
  'Rio Elite': 0.008
};

const initCronJobs = () => {
  // Runs every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [CRON] Initializing daily profit distribution...');
    
    try {
      const activeUsers = await User.find({ isPlanActive: true });
      if (activeUsers.length === 0) return console.log('🕒 [CRON] No active nodes found.');

      for (let user of activeUsers) {
        const rate = RIO_RATES[user.plan] || 0;
        
        // Calculate based on the specific 'investment' entry in ledger
        const lastInvestment = user.ledger
          .filter(entry => entry.type === 'investment')
          .slice(-1)[0]; // Safer way to get last element

        if (lastInvestment && rate > 0) {
          const dailyProfit = Math.abs(lastInvestment.amount) * rate;
          const currentEur = user.balances.get('EUR') || 0;

          // 1. Update Map Balance
          user.balances.set('EUR', currentEur + dailyProfit);

          // 2. Add Ledger Entry
          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit', // Matched to your Model enum
            status: 'completed',
            description: `Daily ROI: ${user.plan} Node Sync`,
            createdAt: new Date()
          });

          // 3. Inform Mongoose of Map change & Save
          user.markModified('balances');
          await user.save({ validateBeforeSave: false });
        }
      }
      console.log(`✅ [CRON] Distributed profits to ${activeUsers.length} users.`);
    } catch (err) {
      console.error('❌ [CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

