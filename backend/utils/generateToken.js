import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    console.error('❌ JWT_SECRET missing or too weak!');
    throw new Error('Server Configuration Error: Security protocols not met.');
  }

  if (!userId) {
    throw new Error('Internal Server Error: Identity mapping failed.');
  }

  try {
    const token = jwt.sign({ id: String(userId) }, secret, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      algorithm: 'HS256',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[JWT] Token issued for: ${userId}`);
    }

    return token;
  } catch (error) {
    console.error(`[JWT SIGNING FAILED]: ${error.message}`);
    throw new Error('Authorization protocol failed.');
  }
};

export default generateToken;
