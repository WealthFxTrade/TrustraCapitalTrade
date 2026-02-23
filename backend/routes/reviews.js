import express from 'express';
import { protect } from '../middleware/auth.js';
import Review from '../models/Review.js';

const router = express.Router();

// @desc    Get latest 5 reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    // If your DB is empty, this returns an empty array [] (Status 200)
    const reviews = await Review.find()
      .populate('user', 'name') // Optional: pulls user name if linked in model
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json(reviews);
  } catch (error) {
    next(error); // Passes error to your errorHandler in app.js
  }
});

// @desc    Submit review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide a rating and comment' });
    }

    const review = await Review.create({
      user: req.user._id,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ 
      success: true,
      message: 'Review submitted successfully', 
      review 
    });
  } catch (error) {
    next(error);
  }
});

export default router;

