import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Request a withdrawal in EUR
 * @route POST /api/withdrawals/request
 * @access Private
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, walletAddress } = req.body;

    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Invalid withdrawal amount');
    }

    if (!walletAddress) {
      throw new ApiError(400, 'Destination wallet address is required');
    }

    // 1. Fetch user
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    // 2. Check EUR balance
    const currentBal = user.balances.get('EUR') || 0;
    if (currentBal < amount) {
      throw new ApiError(400, 'Insufficient Euro balance');
    }

    // 3. Lock funds
    user.balances.set('EUR', currentBal - amount);

    // 4. Add ledger entry
    user.ledger.push({
      amount: Number(amount),
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to: ${walletAddress}`,
      createdAt: new Date()
    });

    user.markModified('balances');
    user.markModified('ledger');

    await user.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted for approval'
    });

  } catch (err) {
    next(err); // use global error handler
  }
};
