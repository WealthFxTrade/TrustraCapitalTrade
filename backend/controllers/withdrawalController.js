import Withdrawal from '../models/Withdrawal.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Get all system activity logs for Admin Audit
 * @route   GET /api/admin/activity
 * @access  Private/Admin
 */
export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await LedgerEntry.find({})
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) { next(err); }
};

/**
 * @desc    Request a new withdrawal
 * @route   POST /api/withdrawals
 * @access  Private
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, asset, address } = req.body;
    
    // Logic: Check if user has enough balance before creating
    // (This assumes you have balance check logic in place)
    
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      asset,
      address,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, withdrawal });
  } catch (err) { next(err); }
};

/**
 * @desc    Get withdrawals for the logged-in user
 * @route   GET /api/withdrawals/my
 * @access  Private
 */
export const getMyWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      withdrawals
    });
  } catch (err) { next(err); }
};

/**
 * @desc    Update Withdrawal Status (Admin Only)
 * @route   PUT /api/admin/withdrawals/:id
 * @access  Private/Admin
 */
export const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!withdrawal) throw new ApiError(404, "Withdrawal record not found");
    
    res.status(200).json({ success: true, withdrawal });
  } catch (err) { next(err); }
};
