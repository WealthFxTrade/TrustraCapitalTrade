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
    ...data
  });
};

/* =========================================================
   USER LOGIC
========================================================= */

/**
 * @desc Get User Dashboard (Frontend UserContext Compatible)
 * @route GET /user/dashboard
 */
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    /* ---------- Convert balances Map safely ---------- */
    const balances =
      user.balances instanceof Map
        ? Object.fromEntries(user.balances)
        : user.balances || {};

    const mainBalance = Object.values(balances).reduce(
      (acc, val) => acc + Number(val || 0),
      0
    );

    /* ---------- Stats object (exactly what frontend expects) ---------- */
    const stats = {
      mainBalance,
      profit: Number(user.profit ?? 0),
      activeNodes: Number(user.activeNodes ?? 0),
      dailyROI: Number(user.dailyROI ?? 0),
      activePlan: user.activePlan ?? "None"
    };

    /* ---------- Fetch recent deposits as transactions ---------- */
    const deposits = await Deposit.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const transactions = deposits.map((dep) => ({
      id: dep._id,
      type: "deposit",
      amount: Number(dep.amount),
      currency: dep.currency,
      status: dep.status,
      date: dep.createdAt
    }));

    return sendResponse(res, 200, true, {
      stats,
      transactions
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Get User Balances
 */
export const getUserBalances = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    const balances =
      user.balances instanceof Map
        ? Object.fromEntries(user.balances)
        : user.balances || {};

    return sendResponse(res, 200, true, { balances });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Get Full User Ledger
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

/**
 * @desc Approve deposit and credit user (Atomic Transaction)
 */
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

    const currentBalance =
      user.balances.get(deposit.currency) || 0;

    user.balances.set(
      deposit.currency,
      currentBalance + Number(deposit.amount)
    );

    deposit.status = "completed";

    await deposit.save({ session });
    user.markModified("balances");
    await user.save({ session });

    await session.commitTransaction();

    return sendResponse(
      res,
      200,
      true,
      {},
      "Deposit approved and credited."
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Approve Deposit Error:", error);
    return sendResponse(res, 400, false, {}, error.message);
  } finally {
    session.endSession();
  }
};

/**
 * @desc Get All Users (Admin)
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    return sendResponse(res, 200, true, { users });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/**
 * @desc Update User Balance (Admin Manual Adjustment)
 */
export const updateUserBalance = async (req, res) => {
  try {
    const { userId, currency, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, {}, "User not found");
    }

    const currentBalance = user.balances.get(currency) || 0;
    user.balances.set(currency, currentBalance + Number(amount));

    user.markModified("balances");
    await user.save();

    return sendResponse(res, 200, true, {}, "Balance updated");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

/**
 * @desc Ban User
 */
export const banUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { banned: true });
    return sendResponse(res, 200, true, {}, "User banned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

/**
 * @desc Unban User
 */
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { banned: false });
    return sendResponse(res, 200, true, {}, "User unbanned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};
