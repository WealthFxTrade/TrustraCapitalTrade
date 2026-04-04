// backend/utils/sendTokenResponse.js
import crypto from 'crypto';
import { ApiError } from '../middleware/errorMiddleware.js';
import generateToken from './generateToken.js';

/**
 * Create token, set cookie, and send response
 */
const sendTokenResponse = async (user, statusCode, res, options = {}) => {
  try {
    const token = generateToken(user._id);

    // Format balances
    let formattedBalances = {};
    if (user.balances) {
      if (typeof user.balances.toJSON === 'function') {
        formattedBalances = user.balances.toJSON();
      } else if (user.balances instanceof Map) {
        formattedBalances = Object.fromEntries(user.balances);
      } else {
        formattedBalances = user.balances;
      }
    }

    // ✅ Cookie options
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      path: '/',
    };

    res.cookie('trustra_token', token, cookieOptions);

    // Optional session tracking
    if (options.userAgent && options.ipAddress) {
      const sessionDuration = options.sessionDurationMs || 30 * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + sessionDuration);
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      user.sessions.push({
        token: hashedToken,
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        expiresAt,
      });

      await user.save();
    }

    // Send response
    res.status(statusCode).json({
      success: true,
      message: statusCode === 201 ? 'Account created successfully' : 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus || 'unverified',
        balances: formattedBalances,
        activePlan: user.activePlan || 'Class III: Prime',
      },
      token, // optional: include for frontend JS
    });
  } catch (err) {
    console.error('[AUTH ERROR] sendTokenResponse failed:', err.message);
    throw new ApiError(500, 'Authentication failed. Please try again.');
  }
};

export { sendTokenResponse };
