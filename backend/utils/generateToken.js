// utils/generateToken.js
import jwt from 'jsonwebtoken';

/**
 * ── 🔑 GENERATE ACCESS CIPHER ──
 * Creates a signed JWT token string.
 * This is a pure function—it does NOT handle res.cookie.
 * * @param {string} userId - The MongoDB User ID (_id)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  // 1. Critical Configuration Check
  if (!secret) {
    console.error('------------------------------------------------------------');
    console.error('❌ [JWT ERROR]: JWT_SECRET is missing from .env');
    console.error('💡 ACTION: Add JWT_SECRET=your_random_string to your .env');
    console.error('------------------------------------------------------------');
    throw new Error('Server configuration error – Identity provider offline');
  }

  // 2. Sign the Token
  // Payload 'id' matches the 'decoded.id' check in authMiddleware.js
  try {
    const token = jwt.sign(
      { id: userId }, 
      secret,
      { 
        expiresIn: '30d', // Long-lived session for better user experience
        algorithm: 'HS256' 
      }
    );

    return token;
  } catch (error) {
    console.error(`[JWT SIGNING ERROR]: ${error.message}`);
    throw new Error('Failed to generate authentication token');
  }
};

export default generateToken;
