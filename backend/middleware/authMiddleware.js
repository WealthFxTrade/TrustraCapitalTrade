import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn(`[AUTH] No token → (${req.method}) ${req.originalUrl}`);
    res.status(401);
    throw new Error('Not authorized - No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized - Invalid token payload');
    }

    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      res.status(401);
      throw new Error('Not authorized - User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized - Invalid session');
  }
});

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  res.status(403);
  throw new Error('Access denied - Administrative privileges required');
};

export { protect, admin };
