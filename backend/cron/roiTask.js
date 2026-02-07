import cron from 'node-cron';
import User from '../models/User';

// ROI Rates Table
const PLAN_RATES = {
  'Starter': 0.02, // 2% daily
  'Premium': 0.05, // 5% daily
  'Gold': 0.10     // 10% daily
};

// Schedule: Runs every day at 00:00 (Midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily Euro ROI distribution...');
  
  try {
    // Find users with an active plan
    const activeUsers = await User.find({ isPlanActive: true });

    for (const user of activeUsers) {
      // Find the last investment amount from the ledger
      const lastInvestment = user.ledger
        .filter(entry => entry.type === 'investment' && entry.status === 'completed')
        .pop();

      if (lastInvestment) {
        const rate = PLAN_RATES[user.plan] || 0;
        const dailyProfit = lastInvestment.amount * rate;

        // 1. Add profit to the 'EUR' balance (Profit Wallet)
        const currentBalance = user.balances.get('EUR') || 0;
        user.balances.set('EUR', currentBalance + dailyProfit);

        // 2. Record profit in ledger using EUR currency
        user.ledger.push({
          amount: dailyProfit,
          currency: 'EUR', // Changed from USD to EUR
          type: 'roi_profit',
          status: 'completed',
          description: `Daily ROI profit (€) for ${user.plan} plan`
        });

        // 3. Mark modified for Mongoose Map and save
        user.markModified('balances');
        user.markModified('ledger');
        await user.save();
      }
    }
    console.log('Euro ROI distribution completed successfully.');
  } catch (err) {
    console.error('ROI Cron Error:', err);
  }
});

