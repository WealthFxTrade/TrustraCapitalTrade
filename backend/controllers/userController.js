import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import mongoose from "mongoose";

const sendResponse = (res, status, success, data = {}, message = null) => {
  return res.status(status).json({ success, ...(message && { message }), ...data });
};

/* ================= USER LOGIC ================= */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return sendResponse(res, 404, false, {}, "User not found");
    return sendResponse(res, 200, true, { user });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const balances = user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances || {};
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

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true }).select('-password');
    return sendResponse(res, 200, true, { user }, "Profile updated");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

export const getUserLedger = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    return sendResponse(res, 200, true, deposits);
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

/* ================= ADMIN LOGIC ================= */

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    return sendResponse(res, 200, true, { users });
  } catch (error) {
    return sendResponse(res, 500, false, {}, "Server error");
  }
};

export const distributeProfit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const user = await User.findById(id);
    const current = user.balances.get("EUR_PROFIT") || 0;
    user.balances.set("EUR_PROFIT", current + Number(amount));
    user.markModified("balances");
    await user.save();
    return sendResponse(res, 200, true, {}, "Profit distributed");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

// 🟢 FIX: This was the missing export causing your SyntaxError
export const approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.body;
    const deposit = await Deposit.findByIdAndUpdate(depositId, { status: 'completed' }, { new: true });
    return sendResponse(res, 200, true, { deposit }, "Deposit approved");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

export const updateUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    return sendResponse(res, 200, true, { user }, "Balance updated");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

export const banUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { banned: true });
    return sendResponse(res, 200, true, {}, "User banned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

export const unbanUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { banned: false });
    return sendResponse(res, 200, true, {}, "User unbanned");
  } catch (error) {
    return sendResponse(res, 400, false, {}, error.message);
  }
};

