import express from 'express';
import { protect } from '../middleware/auth.js';
import Review from '../models/Review.js';

const router = express.Router();

// Get latest 5 reviews
router.get('/', async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(5);
  res.json(reviews);
});

// Submit review (authenticated)
router.post('/', protect, async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.create({
    user: req.user._id,
    rating,
    comment,
  });
  res.json({ message: 'Review submitted', review });
});

export default router;
