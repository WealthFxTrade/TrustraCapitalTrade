// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional: Add rate limiting in production (uncomment when ready)
// const rateLimit = require('express-rate-limit');
// router.use('/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
// router.use('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

// =============================================
// REGISTER / SIGNUP
// =============================================
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // 1. Input validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // 3. Hash password (12 rounds is good balance in 2025)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    user = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      // plan: 'None' → default in model
      // role: 'user' → default in model
    });

    await user.save();

    // 5. Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing in environment');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // or '7d' / '1h' depending on your preference
    );

    // 6. Success response (never send password or sensitive fields)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || 'user',
        plan: user.plan || 'None',
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error('[REGISTER ERROR]', err.stack || err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration. Please try again later.' 
    });
  }
});

// =============================================
// LOGIN
// =============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // 2. Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // 4. Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 5. Success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || 'user',
        plan: user.plan || 'None',
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err.stack || err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again later.' 
    });
  }
});

export default router;
