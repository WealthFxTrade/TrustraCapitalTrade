import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/* ===========================
   OFFICIAL TRUSTRACAPITALTRADE PLANS
=========================== */
const PLANS = {
  starter: { min: 100, max: 999, roi: 8 },
  pro: { min: 1000, max: 9999, roi: 15 },
  premium: { min: 10000, max: 99999, roi: 50 },
  elite: { min: 100000, max: Infinity, roi: 80 },
};

/* GET ALL PLANS */
router.get('/tiers', protect, (req, res) => {
  res.json([
    { name: 'Starter', key: 'starter', ...PLANS.starter },
    { name: 'Pro', key: 'pro', ...PLANS.pro },
    { name: 'Premium', key: 'premium', ...PLANS.premium },
    { name: 'Elite', key: 'elite', ...PLANS.elite },
  ]);
});

/* ACTIVATE INVESTMENT */
router.post('/activate', protect, async (req, res) => {
  const { plan, amount } = req.body;

  const selected = PLANS[plan];
  if (!selected) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  if (amount < selected.min || amount > selected.max) {
    return res.status(400).json({ error: 'Amount not allowed for this plan' });
  }

  const user = await User.findById(req.user._id);

  if (user.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  user.balance -= amount;
  user.plan = plan;
  user.activeInvestment = {
    amount,
    roi: selected.roi,
    startedAt: new Date(),
  };

  await user.save();

  res.json({
    success: true,
    message: 'Investment activated successfully',
    plan,
    amount,
    roi: selected.roi,
  });
});

export default router;
