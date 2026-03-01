import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get High-Level System Metrics (Admin Only)
 * @route   GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeNodes = await User.countDocuments({ "investment.active": true });
    const pendingWithdrawals = await Transaction.countDocuments({ 
      type: 'withdrawal', 
      status: 'pending' 
    });
    
    // Aggregating Global BTC Liquidity
    const btcStats = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Fetch the 10 most recent investors for the dashboard table
    const latestUsers = await User.find()
      .select('fullName email balances investment kycStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      totalUsers,
      activeUsers: totalUsers,
      activeInvestments: activeNodes,
      pendingWithdrawals,
      totalDepositedBtc: btcStats[0]?.total || 0,
      systemHealth: 'Optimal',
      users: latestUsers
    });
  } catch (error) {
    console.error("Stats Engine Error:", error);
    res.status(500).json({ message: "Intelligence Node Offline" });
  }
};

/**
 * @desc    Get all users (Admin Only)
 * @route   GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Registry access denied" });
  }
};

/**
 * @desc    Update User Status/Balance (Admin Only)
 * @route   PUT /api/admin/users/:id
 * @note    Renamed to updateUserStatus to fix the adminRoutes.js import error
 */
export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User node not found" });

    // Update basic fields
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.kycStatus) user.kycStatus = req.body.kycStatus;
    if (req.body.status) user.status = req.body.status;

    // Safely update nested balances
    if (req.body.balances) {
      user.balances = { ...user.balances.toObject(), ...req.body.balances };
    }

    await user.save();
    res.status(200).json({ message: "User node updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Update protocol failed" });
  }
};

// Alias to ensure backward compatibility
export const updateUser = updateUserStatus;

/**
 * @desc    Purge User Node (Admin Only)
 * @route   DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete active admin node" });
    }
    
    await user.deleteOne();
    res.status(200).json({ message: "User node purged" });
  } catch (error) {
    res.status(500).json({ message: "Purge protocol failed" });
  }
};

// --- USER LEVEL CONTROLLERS ---

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Profile access failed" });
  }
};

export const getMyDepositAddress = async (req, res) => {
  try {
    const address = process.env.MASTER_BTC_ADDRESS || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    res.status(200).json({ address });
  } catch (error) {
    res.status(500).json({ message: "Deposit gateway error" });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid current password" });                                                     
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: "Security updated" });
  } catch (error) {
    res.status(500).json({ message: "Password update failed" });
  }
};

export const uploadKYC = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.kycStatus = 'pending';
    await user.save();
    res.status(200).json({ message: "Identity node transmitted", user });
  } catch (error) {
    res.status(500).json({ message: "KYC upload failed" });
  }
};
