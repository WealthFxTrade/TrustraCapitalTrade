const updateProfits = async () => {
  try {
    const users = await User.find({ plan: { $ne: 'None' } });
    const today = new Date();

    for (const user of users) {
      const daysSinceLastUpdate = Math.floor((today - user.lastProfitUpdate) / (1000 * 60 * 60 * 24));
      if (daysSinceLastUpdate > 0) {
        const dailyProfit = user.balance * user.dailyRate * daysSinceLastUpdate;
        if (dailyProfit > 0) {
          user.balance += dailyProfit;
          user.lastProfitUpdate = today;

          // Log profit as transaction
          await Transaction.create({
            user: user._id,
            type: 'profit',
            amount: dailyProfit,
            description: `Daily profit accrual (${user.plan})`,
          });

          await user.save();
        }
      }
    }
    console.log('Daily profits updated and logged');
  } catch (err) {
    console.error('Profit cron error:', err);
  }
};
