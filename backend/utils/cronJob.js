import cron from 'node-cron';
import User from '../models/User.js';

// Pass 'io' as a parameter
const initCronJobs = (io) => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [SYSTEM] Initializing Global ROI Distribution...');

    try {
      const activeUsers = await User.find({ isPlanActive: true, banned: false });

      for (let user of activeUsers) {
        // ... (Your existing calculation logic) ...
        const dailyProfit = user.investedAmount * (user.dailyRoiRate || 0.01); 

        // Update DB
        const currentProfit = user.balances.get('EUR_PROFIT') || 0;
        user.balances.set('EUR_PROFIT', Number((currentProfit + dailyProfit).toFixed(2)));
        
        user.markModified('balances');
        await user.save({ validateBeforeSave: false });

        // 🚀 REAL-TIME NOTIFICATION
        if (io) {
          io.to(user._id.toString()).emit('profit_update', {
            newProfit: user.balances.get('EUR_PROFIT'),
            addedAmount: dailyProfit,
            message: `Daily ROI of €${dailyProfit.toFixed(2)} secured.`
          });
        }
      }
      console.log(`✅ [SOCKET] Live updates pushed to ${activeUsers.length} nodes.`);
    } catch (err) {
      console.error('❌ [CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

