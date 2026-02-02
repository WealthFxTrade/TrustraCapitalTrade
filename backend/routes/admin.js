import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import AuditLog from "../models/AuditLog.js";

import { ApiError } from "../middleware/errorMiddleware.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ALL ADMIN ROUTES ARE PROTECTED
 */
router.use(protect, authorize("admin", "superadmin"));

/**
 * @route   GET /api/admin/stats
 * @desc    Platform statistics
 */
router.get("/stats", async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });

    const pendingWithdrawals = await Transaction.countDocuments({
      type: "withdrawal",
      status: "pending",
    });

    const platformBalances = await User.aggregate([
      { $project: { balances: { $objectToArray: "$balances" } } },
      { $unwind: "$balances" },
      {
        $group: {
          _id: "$balances.k",
          total: { $sum: "$balances.v" },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingWithdrawals,
        platformBalances,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    List users (paginated)
 */
router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select("-password -ledger")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      users,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Recent admin actions
 */
router.get("/audit-logs", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    const logs = await AuditLog.find()
      .populate("admin", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/admin/users/:id/adjust-balance
 * @desc    Admin balance adjustment (transaction-safe)
 */
router.post("/users/:id/adjust-balance", async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, currency, type, description } = req.body;

    if (
      !amount ||
      amount <= 0 ||
      !currency ||
      !["credit", "debit"].includes(type)
    ) {
      throw new ApiError(400, "Invalid adjustment parameters");
    }

    const user = await User.findById(req.params.id).session(session);
    if (!user) throw new ApiError(404, "User not found");

    const currentBal = user.balances.get(currency) || 0;

    if (type === "debit" && currentBal < amount) {
      throw new ApiError(400, "Insufficient balance for debit");
    }

    const signedAmount = type === "credit" ? amount : -amount;

    user.balances.set(currency, currentBal + signedAmount);

    user.ledger.push({
      amount: Math.abs(amount),
      signedAmount,
      currency,
      type: "adjustment",
      source: "admin_adjustment",
      description: description || `Admin ${type} adjustment`,
      status: "completed",
    });

    await user.save({ session });

    await AuditLog.create(
      [
        {
          admin: req.user._id,
          action: "ADJUST_BALANCE",
          targetId: user._id,
          targetModel: "User",
          metadata: { amount, currency, type, description },
          ip: req.ip,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Balance adjusted successfully",
      balances: user.balances,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

export default router;
