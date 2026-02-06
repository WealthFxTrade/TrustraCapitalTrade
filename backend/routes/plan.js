import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999, dailyRate: 0.003 }, // ~9% monthly
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999, dailyRate: 0.004 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999, dailyRate: 0.005 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999, dailyRate: 0.006 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity, dailyRate: 0.008 },
];

/**
 * @route   GET /api/plans
 * @desc    Get all available Rio plans
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    plans: RIO_PLANS,
    data: RIO_PLANS
  });
});

/**
 * @route   POST /api/plans/invest
 * @desc    Invest in a Rio plan
 */
router.post('/invest', protect, async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Find the plan
    const plan = RIO_PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Invalid plan selected' });
    }

    // 2. Validate investment amount
    if (amount < plan.min || amount > plan.max) {
      return res.status(400).json({ 
        success: false, 
        message: `Investment for ${plan.name} must be between $${plan.min} and $${plan.max}` 
      });
    }

    // 3. Check user USD balance
    const currentBalance = user.balances.get('USD') || 0;
    if (currentBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient USD balance' });
    }

    // 4. Execute Transaction
    // Deduct balance
    user.balances.set('USD', currentBalance - amount);
    
    // Update User Plan Status
    user.plan = plan.name;
    user.isPlanActive = true;

    // Add to Ledger
    user.ledger.push({
      amount: amount,
      currency: 'USD',
      type: 'investment',
      status: 'completed',
      createdAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully invested $${amount} in ${plan.name}`,
      user: {
        plan: user.plan,
        balance: user.balances.get('USD')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

