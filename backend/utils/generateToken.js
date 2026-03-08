import jwt from 'jsonwebtoken';

/**
 * ── GENERATE ACCESS CIPHER ──
 * Creates a JWT token string. Does NOT set cookies.
 * Cookie setting should be done in the controller for clarity & control.
 * @param {string} userId - MongoDB User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('[JWT ERROR] JWT_SECRET is not set in environment variables');
    throw new Error('Server configuration error – contact support');
  }

  const token = jwt.sign(
    { id: userId }, // payload
    secret,
    { expiresIn: '30d' } // adjust duration as needed: '7d', '1h', etc.
  );

  return token;
};

export default generateToken;
