import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;
    const counter = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true }
    );
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, counter.btcIndexCounter);
    const newUser = await User.create({
      fullName, email: email.toLowerCase(), phone, password,
      btcIndex: counter.btcIndexCounter, btcAddress, isCounter: false
    });
    res.status(201).json({ success: true, token: generateToken(newUser._id, newUser.role), user: { btcAddress } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), isCounter: { $ne: true } }).select('+password');
    if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
    res.json({ success: true, token: generateToken(user._id, user.role), user: { btcAddress: user.btcAddress } });
  } catch (err) { next(err); }
});

export default router;
