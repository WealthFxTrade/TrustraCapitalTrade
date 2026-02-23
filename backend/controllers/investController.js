import db from '../models';

export const investNow = async (req, res) => {
  try {
    const { amount, planName } = req.body;
    const userId = req.user.id;

    const user = await db.User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Check if user has enough balance in EUR
    // Note: We changed 'USD' to 'EUR' to match your dashboard display
    const currentBalance = user.balances.get('EUR') || 0;
    
    if (currentBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient Euro balance' });
    }

    // 2. Deduct amount from EUR balance
    user.balances.set('EUR', currentBalance - amount);
    
    // 3. Update User Plan status
    user.plan = planName;
    user.isPlanActive = true;

    // 4. Create Ledger Entry with Euro currency
    user.ledger.push({
      amount: amount,
      currency: 'EUR', // Changed from USD to EUR
      type: 'investment',
      status: 'completed',
      description: `Investment in ${planName} plan`
    });

    // Save changes to database
    await user.save();

    res.json({ 
      success: true, 
      message: 'Investment successful', 
      newBalance: user.balances.get('EUR'),
      currencySymbol: '€' 
    });

  } catch (err) {
    console.error("Investment Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

