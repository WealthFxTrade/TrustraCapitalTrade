import User from '../models/User.js';

// @desc    Request a withdrawal
// @route   POST /api/withdrawal/request
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, currency, address } = req.body;
    const user = await User.findById(req.user.id);

    if (user.balances.EUR_PROFIT < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient profit balance' });
    }

    // Logic: Deduct balance and add to ledger
    user.balances.EUR_PROFIT -= amount;
    user.ledger.push({
      amount,
      currency: currency || 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to ${address}`
    });

    await user.save();
    res.json({ success: true, message: 'Withdrawal request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's own withdrawals
export const getMyWithdrawals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const withdrawals = user.ledger.filter(item => item.type === 'withdrawal');
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all withdrawals (Admin only)
export const getAllWithdrawals = async (req, res) => {
  try {
    const users = await User.find({ 'ledger.type': 'withdrawal' });
    let allWithdrawals = [];
    users.forEach(u => {
      u.ledger.forEach(l => {
        if (l.type === 'withdrawal') {
          allWithdrawals.push({ ...l.toObject(), userId: u._id, userEmail: u.email });
        }
      });
    });
    res.json({ success: true, data: allWithdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update withdrawal status (Admin only)
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findOne({ 'ledger._id': req.params.id });
    
    if (!user) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const tx = user.ledger.id(req.params.id);
    tx.status = status;

    // If failed, refund the user
    if (status === 'failed') {
      user.balances.EUR_PROFIT += tx.amount;
    }

    await user.save();
    res.json({ success: true, message: `Withdrawal marked as ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
