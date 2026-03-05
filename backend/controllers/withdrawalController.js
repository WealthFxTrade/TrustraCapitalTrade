import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Initiate a new withdrawal request (Locks Capital)
 * @route   POST /api/withdrawal/request
 */
export const requestWithdrawal = async (req, res, next) => {
    try {
        const { amount, asset, address, network } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) throw new ApiError(404, 'Node identity not found');

        // 1. Balance Verification
        if (user.totalBalance < amount) {
            throw new ApiError(400, 'Insufficient Capital Allocation for this request');
        }

        // 2. Create Withdrawal Record
        const withdrawal = await Withdrawal.create({
            user: user._id,
            amount,
            asset: asset || 'BTC',
            address,
            network,
            status: 'pending'
        });

        // 3. Capital Locking Logic: Deduct from balance immediately
        user.totalBalance -= amount;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Withdrawal protocol initiated. Pending Admin Audit.',
            data: withdrawal
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Fetch history for the authenticated node
 * @route   GET /api/withdrawal/history
 */
export const getMyWithdrawals = async (req, res, next) => {
    try {
        const history = await Withdrawal.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: history });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Cancel a pending request & Refund Capital
 * @route   DELETE /api/withdrawal/cancel/:id
 */
export const cancelWithdrawal = async (req, res, next) => {
    try {
        const withdrawal = await Withdrawal.findOne({
            _id: req.params.id,
            user: req.user.id,
            status: 'pending' // Only allow cancellation of pending requests
        });

        if (!withdrawal) {
            throw new ApiError(404, 'Request not found or already processed');
        }

        // 1. Mark as cancelled
        withdrawal.status = 'cancelled';
        await withdrawal.save();

        // 2. Capital Refund: Return the locked funds to the user
        const user = await User.findById(req.user.id);
        user.totalBalance += withdrawal.amount;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Withdrawal cancelled. Capital refunded to Node.'
        });
    } catch (err) {
        next(err);
    }
};
