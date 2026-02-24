import User from '../models/User.js';

export const createInvestment = async (req, res) => {
  try {
    const { amount, plan } = req.body;
    const user = await User.findById(req.user.id);

    if (user.balances.EUR < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    user.balances.EUR -= amount;
    user.investedAmount += amount;
    user.plan = plan;
    user.ledger.push({ amount, type: 'investment', status: 'completed', description: `Invested in ${plan}` });

    await user.save();
    res.json({ success: true, message: 'Investment successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyInvestments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const investments = user.ledger.filter(item => item.type === 'investment');
    res.json({ success: true, data: investments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
