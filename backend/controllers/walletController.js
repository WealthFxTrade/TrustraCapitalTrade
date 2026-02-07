import User from '../models/User.js';

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Check if user has enough EUR balance
    const currentBal = user.balances.get('EUR') || 0;
    if (currentBal < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient Euro balance' });
    }

    // 2. Lock the funds by deducting them now
    user.balances.set('EUR', currentBal - amount);

    // 3. Create a pending ledger entry
    user.ledger.push({
      amount: Number(amount),
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to: ${walletAddress}`
    });

    user.markModified('balances');
    await user.save();

    res.json({ success: true, message: 'Withdrawal request submitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

