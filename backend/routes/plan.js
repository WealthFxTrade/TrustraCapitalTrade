import express from 'express';
const router = express.Router();

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999 },
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity },
];

// GET all plans
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    count: RIO_PLANS.length,
    data: RIO_PLANS
  });
});

// GET plan by ID
router.get('/:id', (req, res) => {
  const plan = RIO_PLANS.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Investment plan not found'
    });
  }
  res.status(200).json({ success: true, data: plan });
});

export default router;
