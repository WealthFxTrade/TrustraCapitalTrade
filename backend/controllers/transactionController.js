/**
 * controllers/transactionController.js
 * Transaction & Ledger Controller for Trustra Capital
 */

import mongoose from "mongoose";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Withdrawal from "../models/Withdrawal.js";

/**
 * GET /api/transactions/history
 * Get authenticated user's transaction history
 */
export const getTransactionHistory = asyncHandler(async (req, res, next) => {

  try {

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });

  } catch (error) {

    next(new ApiError(500, "Failed to retrieve ledger data"));

  }

});


/**
 * POST /api/transactions/withdraw
 * Initiate withdrawal
 */
export const initiateWithdrawal = asyncHandler(async (req, res, next) => {

  const session = await mongoose.startSession();

  try {

    await session.startTransaction();

    const { amount, destination, currency = "EUR" } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new ApiError(404, "Authorized user not found");
    }

    if (amount < 80) {
      throw new ApiError(400, "Minimum withdrawal is €80.00");
    }

    if (user.kycStatus !== "verified") {
      throw new ApiError(403, "KYC verification required");
    }

    const available = user.balances.get(currency) || 0;

    if (available < amount) {
      throw new ApiError(400, "Insufficient liquidity");
    }

    // Deduct balance
    user.balances.set(currency, available - amount);

    // Ledger entry
    user.ledger.push({
      amount: -amount,
      currency,
      type: "withdrawal",
      status: "pending",
      description: `Extraction to ${destination.slice(0, 10)}...`
    });

    user.markModified("balances");

    await user.save({ session });

    // Create transaction
    await Transaction.create([
      {
        user: userId,
        type: "withdrawal",
        amount,
        signedAmount: -amount,
        currency,
        walletAddress: destination,
        status: "pending"
      }
    ], { session });

    // Create withdrawal record
    const [withdrawalRecord] = await Withdrawal.create([
      {
        user: userId,
        amount,
        asset: currency,
        address: destination,
        status: "pending"
      }
    ], { session });

    await session.commitTransaction();

    // Socket update
    const io = req.app.get("io");

    if (io) {
      io.to(userId.toString()).emit("balanceUpdate", {
        balances: Object.fromEntries(user.balances),
        message: "Extraction protocol initiated."
      });
    }

    res.status(201).json({
      success: true,
      withdrawalId: withdrawalRecord._id
    });

  } catch (error) {

    await session.abortTransaction();
    next(error);

  } finally {

    session.endSession();

  }

});
