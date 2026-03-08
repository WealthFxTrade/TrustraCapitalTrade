import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * @desc Protect routes - Verify JWT and check account status
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in Cookies (Secure) or Authorization Header (Bearer)
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Synchronization token missing'
      });
    }

    // 2. Verify Token - Use fallback for development if env is missing
    const secret = process.env.JWT_SECRET || 'trustra_secret_2026';
    const decoded = jwt.verify(token, secret);

    // 3. Sync with ID keys (handles 'userId' or 'id')
    const userId = decoded.userId || decoded.id;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Security breach detected: Invalid node identity'
      });
    }

    // 4. Fetch User - select everything except password
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Identity not found in Registry'
      });
    }

    // 5. Status Check (Matches your User.js model)
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended: Institutional restriction in place'
      });
    }

    // Attach verified user to the request
    req.user = user;
    next();
  } catch (error) {
    console.error('🛡️ [Zurich Auth Error]:', error.message);

    const message = error.name === 'TokenExpiredError'
      ? 'Session expired: Please re-authenticate'
      : 'Invalid Access Cipher: Verification failed';

    return res.status(401).json({ success: false, message });
  }
};

/**
 * @desc Admin clearance only
 */
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrative clearance required'
  });
};

export const auth = protect;
