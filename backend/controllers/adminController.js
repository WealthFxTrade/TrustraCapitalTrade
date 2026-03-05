import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Fetch all registered users/nodes
 * @route   GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update user financial parameters & wallet
 * @route   PATCH /api/admin/user/:id/balance
 */
export const updateUserBalance = async (req, res, next) => {
    try {
        const { totalBalance, totalProfit, btcAddress, ethAddress, kycStatus } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    totalBalance, 
                    totalProfit, 
                    btcAddress, 
                    ethAddress, 
                    kycStatus 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!user) throw new ApiError(404, 'Protocol Error: Node not found');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Fetch all withdrawal requests across the network
 * @route   GET /api/admin/withdrawals
 */
export const getAllWithdrawals = async (req, res, next) => {
    try {
        // Populates user details so you know who is withdrawing
        const withdrawals = await Withdrawal.find({})
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: withdrawals });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Process (Approve/Reject) a withdrawal
 * @route   PATCH /api/admin/withdrawal/:id
 */
export const processWithdrawal = async (req, res, next) => {
    try {
        const { status, transactionHash } = req.body;
        const withdrawal = await Withdrawal.findById(req.params.id);

        if (!withdrawal) throw new ApiError(404, 'Withdrawal request not found');

        withdrawal.status = status;
        if (transactionHash) withdrawal.transactionHash = transactionHash;
        
        await withdrawal.save();
        res.status(200).json({ success: true, data: withdrawal });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Restrict or restore user access
 * @route   PATCH /api/admin/user/:id/toggle-ban
 */
export const toggleUserBan = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new ApiError(404, 'User not found');

        user.banned = !user.banned;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: `User ${user.banned ? 'Restricted' : 'Restored'}` 
        });
    } catch (err) {
        next(err);
    }
};
