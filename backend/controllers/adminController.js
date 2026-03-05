import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Fetch Global System Metrics for Dashboard Cards
 */
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isBanned: false });

        // Aggregate total successful deposits
        const depositStats = await Transaction.aggregate([
            { $match: { type: 'deposit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const pendingWithdrawals = await Transaction.countDocuments({ 
            type: 'withdrawal', 
            status: 'pending' 
        });

        const activeNodes = await User.countDocuments({ 
            activePlan: { $ne: 'none' },
            isActive: true 
        });

        res.status(200).json({
            totalUsers,
            totalDeposits: depositStats[0]?.total || 0,
            pendingWithdrawals,
            activeNodes
        });
    } catch (err) {
        res.status(500).json({ message: "Metrics synchronization failed", error: err.message });
    }
};

/**
 * @desc    Get all users for the User Directory
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user ledger" });
    }
};

/**
 * @desc    Update user balance manually (Admin Override)
 */
export const updateUserBalance = async (req, res) => {
    const { id } = req.params;
    const { amount, type } = req.body; // type: 'add' or 'subtract'

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (type === 'add') {
            user.totalBalance += Number(amount);
        } else {
            user.totalBalance -= Number(amount);
        }

        await user.save();
        res.status(200).json({ message: "Balance updated", newBalance: user.totalBalance });
    } catch (err) {
        res.status(500).json({ message: "Balance update failed" });
    }
};

/**
 * @desc    Get all withdrawal requests for the Queue
 */
export const getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Transaction.find({ type: 'withdrawal' })
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch withdrawal queue" });
    }
};

/**
 * @desc    Approve or Reject a withdrawal
 */
export const processWithdrawal = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'completed' or 'failed'

    try {
        const withdrawal = await Transaction.findById(id);
        if (!withdrawal) return res.status(404).json({ message: "Transaction not found" });

        withdrawal.status = status;
        await withdrawal.save();

        res.status(200).json({ message: `Withdrawal ${status}` });
    } catch (err) {
        res.status(500).json({ message: "Failed to process withdrawal" });
    }
};

/**
 * @desc    Ban or Unban a user
 */
export const toggleUserBan = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isBanned = !user.isBanned;
        await user.save();
        res.status(200).json({ message: user.isBanned ? "User Banned" : "User Unbanned" });
    } catch (err) {
        res.status(500).json({ message: "Toggle ban failed" });
    }
};
