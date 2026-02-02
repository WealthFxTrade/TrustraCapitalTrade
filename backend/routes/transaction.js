import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import { ApiError } from "../middleware/errorMiddleware.js";

const router = express.Router();

/**
 * ----------------------------------------
 * POST /api/transactions/withdraw
 * ----------------------------------------
 * User withdrawal (atomic, safe)
 */
router.post("/withdraw", protect, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, currency, referenceId } = req.body;

    if (!amount || amount <= 0 || !currency) {
      throw new ApiError(400, "Amount and currency are required");
    }

    // Idempotency / replay protection
    if (referenceId) {
      const exists = await Transaction.findOne({ referenceId });
      if (exists) {
        throw new ApiError(409, "Duplicate withdrawal request");
      }
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) throw new ApiError(404, "User not found");

    const currentBalance = user.balances.get(currency) || 0;
    if (currentBalance < amount) {
      throw new ApiError(400, `Insufficient ${currency} balance`);
    }

    // Deduct balance
    user.balances.set(currency, currentBalance - amount);

    // Ledger entry
    user.ledger.push({
      amount,
      signedAmount: -amount,
      currency,
      type: "withdrawal",
      source: "user_withdrawal",
      referenceId,
      status: "pending",
      description: `Withdrawal of ${amount} ${currency}`,
    });

    await user.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          user: user._id,
          type: "withdrawal",
          amount,
          currency,
          status: "pending",
          referenceId,
          initiatedBy: "user",
          ip: req.ip,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Withdrawal request submitted",
      balances: user.balances,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

/**
 * ----------------------------------------
 * GET /api/transactions/my
 * ----------------------------------------
 * User transaction history
 */
router.get("/my", protect, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
});

/**
 * ----------------------------------------
 * ADMIN: GET ALL TRANSACTIONS
 * ----------------------------------------
 */
router.get(
  "/admin/all",
  protect,
  authorize("admin", "superadmin"),
  async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);

      const transactions = await Transaction.find()
        .populate("user", "email fullName")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({ success: true, transactions });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
