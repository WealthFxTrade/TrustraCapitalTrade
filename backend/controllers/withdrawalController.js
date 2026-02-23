import User from '../models/User.js';

/**
 * 👤 USER: REQUEST WITHDRAWAL
 * Deducts from EUR_PROFIT and creates a PENDING entry in the ledger
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amountEur, btcAddress } = req.body;
    const user = await User.findById(req.user.id);

    const available = user.balances.get('EUR_PROFIT') || 0;
    if (available < amountEur) {
      return res.status(400).json({ success: false, message: "Insufficient profit balance" });
    }

    // Atomic Deduction
    user.balances.set('EUR_PROFIT', Number((available - amountEur).toFixed(2)));
    
    // Create Ledger Entry
    user.ledger.push({
      amount: -amountEur,
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal to ${btcAddress}`,
      createdAt: new Date()
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    res.json({ success: true, message: "Withdrawal pending approval" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 👤 USER: GET OWN HISTORY
 */
export const getUserWithdrawals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    const history = user.ledger.filter(item => item.type === 'withdrawal');
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🛡️ ADMIN: GET ALL PENDING
 */
export const getPendingWithdrawals = async (req, res) => {
  try {
    const users = await User.find({ 
      "ledger.status": "pending", 
      "ledger.type": "withdrawal" 
    }).select('email fullName ledger');
    
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🛡️ ADMIN: APPROVE (MARK COMPLETED)
 * This clears the 'pending' status after you send the BTC manually
 */
export const approveWithdrawal = async (req, res) => {
  try {
    const { userId, ledgerId } = req.body;
    const user = await User.findById(userId);
    const entry = user.ledger.id(ledgerId);

    if (!entry || entry.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Invalid or processed record" });
    }

    entry.status = 'completed';
    user.markModified('ledger');
    await user.save();

    res.json({ success: true, message: "Withdrawal approved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🛡️ ADMIN: REJECT (REFUND)
 * Returns the EUR_PROFIT back to the user's wallet
 */
export const rejectWithdrawal = async (req, res) => {
  try {
    const { userId, ledgerId } = req.body;
    const user = await User.findById(userId);
    const entry = user.ledger.id(ledgerId);

    if (!entry || entry.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Invalid or processed record" });
    }

    // Refund the EUR_PROFIT balance
    const currentProfit = user.balances.get('EUR_PROFIT') || 0;
    user.balances.set('EUR_PROFIT', currentProfit + Math.abs(entry.amount));

    entry.status = 'failed';
    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    res.json({ success: true, message: "Withdrawal rejected and refunded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

