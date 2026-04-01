import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

const SALT_ROUNDS = 12;

export const hashPassword = asyncHandler(async (req, res, next) => {
  let { password } = req.body;

  if (
    !password ||
    typeof password !== 'string' ||
    password.startsWith('$2a$') ||
    password.startsWith('$2b$')
  ) {
    return next();
  }

  password = password.trim();

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [HASH] Processing password');
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    req.body.password = hashed;

    next();
  } catch (error) {
    console.error(`❌ [HASH] Bcrypt failed: ${error.message}`);
    res.status(500);
    throw new Error('Password hashing failed. Please try again.');
  }
});

export const comparePassword = async (enteredPassword, storedHash) => {
  return bcrypt.compare(enteredPassword, storedHash);
};

export default {
  hashPassword,
  comparePassword
};
