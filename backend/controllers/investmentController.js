import mongoose from 'mongoose';
import User from '../models/User.js';
import { PLAN_DATA } from '../config/plans.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc   Get all active investments
 * @route  GET /api/investments/active
 */
export const getActiveInvestments = async (req, res) => {
  try {
    const users = await User.find({ isPlanActive: true, banned: false })
      .select('fullName email plan investedAmount balances lastProfitDate');

    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Manually distribute profit (Admin bypass)
 */
export const distributeProfit = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { userId } = req.body;
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user || !user.isPlanActive || user.banned) {
      throw new Error('User not eligible or banned');
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const lastPaid = user.lastProfitDate ? new Date(user.lastProfitDate).setHours(0, 0, 0, 0) : null;
    if (lastPaid === today) throw new Error('Profit already distributed today');

    // Sync: Uses 'plan' to match User.js model
    const planConfig = PLAN_DATA[user.plan]; 
    if (!planConfig) throw new Error('Invalid plan configuration');

    const profit = user.investedAmount * planConfig.dailyROI;
    
    user.balances.set('EUR', (user.balances.get('EUR') || 0) + profit);
    user.ledger.push({
      amount: profit,
      currency: 'EUR',
      type: 'roi_profit',
      status: 'completed',
      description: `Manual ROI: ${planConfig.name}`
    });

    user.lastProfitDate = new Date();
    user.markModified('balances');
    await user.save({ session });

    await AuditLog.create([{
      admin: req.user?._id || null,
      action: 'MANUAL_PROFIT_DISTRIBUTION',
      targetId: user._id,
      targetModel: 'User',
      metadata: { profit, plan: planConfig.name },
      ip: req.ip
    }], { session });

    await session.commitTransaction();
    res.json({ success: true, profit, newBalance: user.balances.get('EUR') });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc   Activate a plan (Deducts balance & starts ROI)
 */
export const activatePlan = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { userId, planKey, amount } = req.body;
    const plan = PLAN_DATA[planKey];
    
    if (!plan) throw new Error('Invalid plan key');
    if (amount < plan.min) throw new Error(`Minimum is ${plan.min} EUR`);

    session.startTransaction();
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const currentBalance = user.balances.get('EUR') || 0;
    if (currentBalance < amount) throw new Error('Insufficient EUR balance');

    // Deduct and Activate
    user.balances.set('EUR', currentBalance - amount);
    user.plan = planKey; // Match model field 'plan'
    user.investedAmount = amount;
    user.isPlanActive = true;
    user.lastProfitDate = new Date(); // Prevents instant cron payout on same day

    user.ledger.push({
      amount: -amount,
      currency: 'EUR',
      type: 'investment',
      status: 'completed',
      description: `Activated ${plan.name}`
    });

    user.markModified('balances');
    await user.save({ session });

    await AuditLog.create([{
      admin: req.user?._id || null,
      action: 'ACTIVATE_PLAN',
      targetId: user._id,
      targetModel: 'User',
      metadata: { planKey, amount },
      ip: req.ip
    }], { session });

    await session.commitTransaction();
    res.json({ success: true, message: `Plan ${plan.name} activated`, newBalance: user.balances.get('EUR') });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

