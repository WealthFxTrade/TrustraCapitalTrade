// controllers/userController.js
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import mongoose from "mongoose";

/* =========================================================
   HELPER: Standard API Response
========================================================= */
const sendResponse = (res, status, success, data = {}, message = null) => {
  return res.status(status).json({
    success,
    ...(message && { message }),
    ...data,
  });
};

/* =========================================================
   USER LOGIC (Frontend-facing)
========================================================= */

/**
 * @desc Get current user's profile (self-view)
 * @route GET /user/me or /user/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -refreshTokens')
      .lean();

    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    return sendResponse(res, 200, true, { profile: user });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Update user profile (self)
 * @route PUT /user/me
 * @access Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // prevent password update here

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    return sendResponse(res, 200, true, { user }, "Profile updated");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

/**
 * @desc Get user dashboard (stats + recent transactions)
 * @route GET /user/dashboard
 * @access Private
 */
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    const balances = user.balances instanceof Map
      ? Object.fromEntries(user.balances)
      : user.balances || {};

    const mainBalance = Object.values(balances).reduce(
      (acc, val) => acc + Number(val || 0),
      0
    );

    const stats = {
      mainBalance,
      profit: Number(user.profit ?? 0),
      activeNodes: Number(user.activeNodes ?? 0),
      dailyROI: Number(user.dailyROI ?? 0),
      activePlan: user.activePlan ?? "None",
    };

    const deposits = await Deposit.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const transactions = deposits.map((dep) => ({
      id: dep._id.toString(),
      type: "deposit",
      amount: Number(dep.amount),
      currency: dep.currency,
      status: dep.status,
      date: dep.createdAt.toISOString(),
    }));

    return sendResponse(res, 200, true, { stats, transactions });
  } catch (error) {
    console.error("getUserDashboard error:", error);
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Get user balances
 * @route GET /user/balance
 * @access Private
 */
export const getUserBalances = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    const balances = user.balances instanceof Map
      ? Object.fromEntries(user.balances)
      : user.balances || {};

    return sendResponse(res, 200, true, { balances });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Get full user ledger
 * @route GET /user/transactions
 * @access Private
 */
export const getUserLedger = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return sendResponse(res, 200, true, { ledger: deposits });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/* =========================================================
   ADMIN LOGIC
========================================================= */

export const approveDeposit = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { depositId } = req.body;

    const deposit = await Deposit.findById(depositId).session(session);
    if (!deposit || deposit.status !== "pending") {
      throw new Error("Invalid or already processed deposit");
    }

    const user = await User.findById(deposit.user).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBalance = user.balances.get(deposit.currency) || 0;
    user.balances.set(deposit.currency, currentBalance + Number(deposit.amount));

    deposit.status = "completed";

    await deposit.save({ session });
    user.markModified("balances");
    await user.save({ session });

    await session.commitTransaction();

    return sendResponse(res, 200, true, {}, "Deposit approved and credited.");
  } catch (error) {
    await session.abortTransaction();
    console.error("approveDeposit error:", error);
    return sendResponse(res, 400, false, {}, error.message);
  } finally {
    session.endSession();
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v -refreshTokens')
      .lean();

    return sendResponse(res, 200, true, { users });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

export const updateUserBalance = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { userId, currency, amount } = req.body;

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBalance = user.balances.get(currency) || 0;
    user.balances.set(currency, currentBalance + Number(amount));

    user.markModified("balances");
    await user.save({ session });

    await session.commitTransaction();

    return sendResponse(res, 200, true, {}, "Balance updated");
  } catch (error) {
    await session.abortTransaction();
    return sendResponse(res, 400, false, {}, error.message);
  } finally {
    session.endSession();
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { banned: true }, { new: true });
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }
    return sendResponse(res, 200, true, {}, "User banned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { banned: false }, { new: true });
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }
    return sendResponse(res, 200, true, {}, "User unbanned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};
