import User from '../models/User.js';

// @desc    Purchase an Investment Plan
// @route   POST /api/user/invest
export const investInPlan = async (req, res) => {
  try {
    const { planName, amount } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "Node not found" });

    // 1. Check EUR Liquidity
    const currentEur = user.balances.get('EUR') || 0;
    if (currentEur < amount) {
      return res.status(400).json({ message: "Insufficient EUR balance to activate plan" });
    }

    // 2. Process Investment
    user.balances.set('EUR', Number((currentEur - amount).toFixed(2)));
    user.activePlan = planName;
    user.totalBalance = user.balances.get('EUR'); // Update total reflected balance

    // 3. Ledger/History Entry
    const investmentRecord = {
      amount: amount,
      currency: 'EUR',
      type: 'investment',
      status: 'active',
      description: `Activated ${planName} Portfolio`,
      timestamp: new Date()
    };
    
    if (user.ledger) {
      user.ledger.push(investmentRecord);
      user.markModified('ledger');
    }

    user.markModified('balances');
    await user.save();

    res.status(200).json({
      success: true,
      message: `${planName} activated successfully`,
      activePlan: user.activePlan,
      newBalance: user.balances.get('EUR')
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
