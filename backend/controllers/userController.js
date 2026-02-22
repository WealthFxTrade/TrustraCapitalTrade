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
 * @desc Get current user's profile
 * @route GET /user/profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -refreshTokens')
      .lean();

    if (!user) return sendResponse(res, 404, false, {}, "User not found");
    return sendResponse(res, 200, true, { user }); // Adjusted to match frontend expected key
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Get user dashboard (Renamed from getUserDashboard to match frontend /user/stats call)
 * @route GET /user/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).lean();
    if (!user) return sendResponse(res, 404, false, {}, "User not found");

    // Convert Map to Object if necessary
    const balances = user.balances instanceof Map 
      ? Object.fromEntries(user.balances) 
      : user.balances || {};

    // Logic to match Frontend StatCards
    const stats = {
      mainBalance: Number(balances.EUR || 0),
      profit: Number(balances.EUR_PROFIT || 0),
      activeNodes: user.isPlanActive ? 1 : 0,
      dailyROI: (user.investedAmount || 0) * (user.dailyRoiRate || 0),
      activePlan: user.activePlan || "None",
    };

    return sendResponse(res, 200, true, stats);
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Get user transactions (ledger)
 * @route GET /user/transactions
 */
export const getUserLedger = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Map to a format the RecentActivity component expects
    const transactions = deposits.map(d => ({
      id: d._id,
      type: "Deposit",
      amount: d.amount,
      status: d.status,
      date: d.createdAt
    }));

    return sendResponse(res, 200, true, transactions);
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/* =========================================================
   ADMIN LOGIC (To support Admin.jsx)
========================================================= */

/**
 * @desc Distribute Profit to User
 * @route PUT /user/distribute/:id
 */
export const distributeProfit = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    const { amount } = req.body;

    const user = await User.findById(id).session(session);
    if (!user) throw new Error("User not found");

    // Credit the EUR_PROFIT balance
    const currentProfit = user.balances.get("EUR_PROFIT") || 0;
    user.balances.set("EUR_PROFIT", currentProfit + Number(amount));

    user.markModified("balances");
    await user.save({ session });

    await session.commitTransaction();
    return sendResponse(res, 200, true, {}, `Distributed €${amount} profit successfully.`);
  } catch (error) {
    await session.abortTransaction();
    return sendResponse(res, 400, false, {}, error.message);
  } finally {
    session.endSession();
  }
};

/**
 * @desc Get all users for Admin Panel
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    return sendResponse(res, 200, true, { users });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, { banned: true });
    return sendResponse(res, 200, true, {}, "User banned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

