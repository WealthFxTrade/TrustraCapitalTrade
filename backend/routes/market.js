import express from 'express';
const router = express.Router();

/**
 * @desc    Example Market Route
 * @route   GET /api/market
 */
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Market API placeholder' });
});

export default router;
