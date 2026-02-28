import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    // Exclude password from the profile fetch
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Investor node not found' });
    }
    
    // Returning the user object directly to match Dashboard.jsx logic
    res.json(user); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      totalBalance: updatedUser.totalBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/user/all
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    // Returning the array directly so Dashboard.jsx map() works immediately
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Access Denied: Registry fetch failed' });
  }
};

// @desc    Update user status (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields if provided in request body
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.role) user.role = req.body.role;
    if (req.body.banned !== undefined) user.banned = req.body.banned;
    if (req.body.totalBalance !== undefined) user.totalBalance = req.body.totalBalance;

    await user.save();
    res.json({ message: 'Investor node updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.deleteOne();
    res.json({ message: 'Investor node purged from registry' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
