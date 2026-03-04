import User from '../models/User.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { ApiError } from '../middleware/errorMiddleware.js';

// ── USER SCOPED LOGIC ──

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.password = req.body.password;
    await user.save();
    res.status(200).json({ success: true, message: "Security Protocol Updated" });
  } catch (err) { next(err); }
};

export const getMyDepositAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('btcAddress ethAddress');
    res.status(200).json({ success: true, addresses: user });
  } catch (err) { next(err); }
};

export const getYieldHistory = async (req, res, next) => {
  try {
    const logs = await LedgerEntry.find({ user: req.user._id, type: 'PROFIT' })
      .sort({ createdAt: -1 }).limit(7).lean();
    
    const history = logs.reverse().map(log => ({
      day: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yield: Number(log.amount.toFixed(2))
    }));
    res.status(200).json({ success: true, history });
  } catch (err) { next(err); }
};

// ── ADMINISTRATIVE OVERRIDES ──

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "Node not found in registry");

    const fields = ['fullName', 'email', 'role', 'isVerified', 'balances'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "Target already purged");
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User redacted from ledger" });
  } catch (err) { next(err); }
};
