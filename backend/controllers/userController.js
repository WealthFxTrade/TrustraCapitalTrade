import User from '../models/User.js';
import Deposit from '../models/Deposit.js'; // Ensure this model exists
import mongoose from 'mongoose';

// ────────────── USER LOGIC ──────────────

export const getUserProfile = async (req, res) => { /* ... */ };
export const updateUserProfile = async (req, res) => { /* ... */ };
export const getUserDashboard = async (req, res) => { /* ... */ };
export const getUserLedger = async (req, res) => { /* ... */ };
export const getUserBalances = async (req, res) => { /* ... */ };
export const verifyUserEmail = async (req, res) => { /* ... */ };
export const resendVerificationEmail = async (req, res) => { /* ... */ };

// ────────────── ADMIN LOGIC ──────────────

/**
 * @desc Approve deposit and credit user
 */
export const approveDeposit = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { depositId } = req.body; // Adjusted to match your route .post('/approve-deposit')

    const deposit = await Deposit.findById(depositId).session(session);
    if (!deposit || deposit.status !== 'pending') {
      throw new Error("Invalid or already processed deposit");
    }

    const user = await User.findById(deposit.user).session(session);
    const currentBalance = user.balances.get(deposit.currency) || 0;
    
    user.balances.set(deposit.currency, currentBalance + deposit.amount);
    deposit.status = 'completed';

    await deposit.save({ session });
    user.markModified('balances');
    await user.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: "Deposit approved and credited." });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getUsers = async (req, res) => { /* ... */ };
export const getUserById = async (req, res) => { /* ... */ };
export const updateUser = async (req, res) => { /* ... */ };
export const deleteUser = async (req, res) => { /* ... */ };
export const updateUserBalance = async (req, res) => { /* ... */ };
export const banUser = async (req, res) => { /* ... */ };
export const unbanUser = async (req, res) => { /* ... */ };
