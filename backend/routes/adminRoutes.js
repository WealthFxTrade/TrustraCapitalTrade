// routes/adminRoutes.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, admin } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Example admin-only route
router.get(
  '/users',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  })
);

export default router;
