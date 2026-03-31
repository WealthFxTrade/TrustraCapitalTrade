// utils/generateToken.js - FULLY UNSHORTENED & CORRECTED VERSION
// Trustra Capital Trade - JWT Token Generator
// Fixed: Better error handling, clearer logs, and secure configuration

import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT access token
 * 
 * @param {string} userId - MongoDB User ID (_id)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  // Critical check: Ensure JWT_SECRET is configured
  if (!secret) {
    console.error('------------------------------------------------------------');
    console.error('❌ [JWT ERROR]: JWT_SECRET is missing from .env file');
    console.error('💡 ACTION: Add JWT_SECRET=your_very_long_random_string to your .env');
    console.error('   Example: JWT_SECRET=supersecretkey1234567890abcdef1234567890');
    console.error('------------------------------------------------------------');
    throw new Error('Server configuration error – JWT secret not configured');
  }

  // Validate userId
  if (!userId) {
    console.error('[JWT ERROR] No userId provided to generateToken');
    throw new Error('Invalid user ID for token generation');
  }

  try {
    // Create token with user ID in payload
    // 'id' field is used in authMiddleware.js to decode the token
    const token = jwt.sign(
      { id: userId },           // Payload
      secret,                   // Secret key
      {
        expiresIn: '30d',       // 30 days - good for user experience
        algorithm: 'HS256'      // Standard secure algorithm
      }
    );

    console.log(`[JWT] Token generated successfully for userId: ${userId}`);
    return token;

  } catch (error) {
    console.error(`[JWT SIGNING ERROR]: ${error.message}`);
    throw new Error('Failed to generate authentication token');
  }
};

export default generateToken;
