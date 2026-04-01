/**
 * Trustra Capital Trade - JWT Utility
 * Status: PRODUCTION READY
 */
import jwt from 'jsonwebtoken';

/**
 * @desc    Generates a signed JWT for a specific user
 * @param   {string|object} userId - The unique MongoDB _id of the user
 * @returns {string} - A signed HS256 JWT
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  // 1. CRITICAL: Secret Validation (Fail-Fast)
  if (!secret || secret.length < 32) {
    console.error('------------------------------------------------------------');
    console.error('❌ [SECURITY ALERT]: JWT_SECRET is missing or too weak!');
    console.error('💡 ACTION: Ensure .env has a 32+ character JWT_SECRET.');
    console.error('------------------------------------------------------------');
    throw new Error('Server Configuration Error: Security protocols not met.');
  }

  // 2. Input Validation
  if (!userId) {
    console.error('❌ [JWT ERROR]: Attempted to generate token for null userId');
    throw new Error('Internal Server Error: Identity mapping failed.');
  }

  try {
    // 3. Signing Operation
    // We explicitly cast userId to String to prevent Object-id mismatches
    const token = jwt.sign(
      { id: String(userId) }, 
      secret, 
      { 
        expiresIn: process.env.JWT_EXPIRE || '30d', 
        algorithm: 'HS256' 
      }
    );

    // 4. Audit Log (Optional, helpful for debugging production auth flows)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[JWT] Token issued for: ${userId}`);
    }

    return token;

  } catch (error) {
    // 5. Catch Signing Errors (e.g., Payload too large, internal JWT error)
    console.error(`❌ [JWT SIGNING FAILED]: ${error.message}`);
    throw new Error('Authorization protocol failed.');
  }
};

export default generateToken;
