import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import mongoose from 'mongoose';

// ────────────────────────────────────────────────
// User Controllers (Authenticated)
// ────────────────────────────────────────────────

// @desc    Get current user profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

// @desc    Update user profile (fullName, phone, password)
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.fullName = req.body.name || user.fullName;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json({ success: true, message: 'Profile updated', user: updatedUser });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

// @desc    Get user dashboard data (Balances & Recent Ledger)
export const getUserDashboard = async (req, res) => {
  const user = await User.findById(req.user._id).select('balances ledger');
  res.json({ 
    success: true, 
    balances: Object.fromEntries(user.balances), // Convert Map to Object for JSON
    recentLedger: user.ledger.slice(-5).reverse() 
  });
};

// @desc    Get full transaction history
export const getUserLedger = async (req, res) => {
  const user = await User.findById(req.user._id).select('ledger');
  res.json({ success: true, ledger: user.ledger.reverse() });
};

// @desc    Get specific balances
export const getUserBalances = async (req, res) => {
  const user = await User.findById(req.user._id).select('balances');
  res.json({ success: true, balances: Object.fromEntries(user.balances) });
};

// ────────────────────────────────────────────────
// Admin Controllers (Admin Only)
// ────────────────────────────────────────────────

// @desc    Approve a pending deposit and credit user balance (Atomic Transaction)
export const approveDeposit = async (req, res) => {
  const { depositId } = req.body;
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const deposit = await Deposit.findOneAndUpdate(
      { _id: depositId, status: 'pending' },
      { $set: { status: 'confirmed', confirmedAt: new Date() } },
      { session, new: true }
    );

    if (!deposit) throw new Error('Deposit not found or already processed');

    await User.updateOne(
      { _id: deposit.user },
      {
        $inc: { [`balances.${deposit.currency}`]: deposit.amount },
        $push: { ledger: {
          amount: deposit.amount,
          currency: deposit.currency,
          type: 'deposit',
          status: 'completed',
          description: `Admin Approved ${deposit.currency} Deposit`
        }}
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, message: 'Deposit approved and credited' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Admin: Update user balance manually
export const updateUserBalance = async (req, res) => {
  const { id } = req.params;
  const { asset, amount, type = 'adjustment' } = req.body; // type: 'add' or 'set'

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const current = user.balances.get(asset) || 0;
  user.balances.set(asset, amount); // Sets the absolute value
  
  user.ledger.push({
    amount: amount - current,
    currency: asset,
    type: 'bonus',
    status: 'completed',
    description: 'Admin balance adjustment'
  });

  user.markModified('balances');
  await user.save();
  res.json({ success: true, message: `${asset} balance updated to ${amount}` });
};

// @desc    Admin: Ban/Unban User
export const banUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { banned: true, isActive: false });
  res.json({ success: true, message: 'User node deactivated (Banned)' });
};

export const unbanUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { banned: false, isActive: true });
  res.json({ success: true, message: 'User node reactivated' });
};

// Standard CRUD for Admin
export const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({ success: true, users });
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json({ success: true, user });
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, user });
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};

// Placeholder for Email Verification (Logic usually in Auth Controller)
export const verifyUserEmail = async (req, res) => { res.json({ message: 'Logic in authController' }); };
export const resendVerificationEmail = async (req, res) => { res.json({ message: 'Logic in authController' }); };

