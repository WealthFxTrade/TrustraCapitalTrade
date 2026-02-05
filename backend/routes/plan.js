// backend/routes/plan.js
import express from 'express';
const router = express.Router();

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999, dailyRate: 0.01 },
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999, dailyRate: 0.02 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999, dailyRate: 0.03 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999, dailyRate: 0.04 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity, dailyRate: 0.05 },
];

// GET all plans
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    // The Dashboard expects a 'plans' key
    plans: RIO_PLANS, 
    // Keep 'data' as backup
    data: RIO_PLANS
  });
});

// GET plan by ID
router.get('/:id', (req, res) => {
  const plan = RIO_PLANS.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Investment plan not found' });
  }
  res.status(200).json({ success: true, plans: [plan], data: plan });
});

export default router;

