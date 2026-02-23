import mongoose from 'mongoose';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Approve user deposit and credit Main Wallet (EUR)
 * @route   POST /api/transactions/approve-deposit
 */
export const approveDeposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId, transactionId } = req.body;

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, "User not found");

    const transaction = user.ledger.id(transactionId);
    if (!transaction || transaction.status !== "pending") {
      throw new ApiError(400, "Invalid or already processed transaction");
    }

    transaction.status = "completed";

    // FIXED: Using "EUR" key to match your 2026 Euro implementation
    const currentMain = user.balances.get("EUR") || 0;
    user.balances.set("EUR", currentMain + Number(transaction.amount));

    await user.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: "Deposit approved & funds credited in EUR" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Withdraw funds from Main Wallet (EUR)
 */
export const requestWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { amount, destinationAddress } = req.body;

    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new ApiError(404, "User not found");

    // FIXED: Checking "EUR" balance
    const mainBalance = user.balances.get("EUR") || 0;
    if (mainBalance < amount) throw new ApiError(400, "Insufficient EUR balance");

    user.balances.set("EUR", mainBalance - Number(amount));

    user.ledger.push({
      amount: Number(amount),
      type: "withdrawal",
      status: "pending",
      description: `Withdrawal of €${amount} to ${destinationAddress}`,
      createdAt: new Date(),
    });

    await user.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: "Withdrawal request submitted" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Move funds from Profit Wallet to Main Wallet (Internal Transfer)
 */
export const reinvestFunds = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { amount } = req.body;

    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new ApiError(404, "User not found");

    if (user.totalProfit < amount) throw new ApiError(400, "Insufficient Profit Wallet balance");

    user.totalProfit -= Number(amount);

    // FIXED: Crediting "EUR" Main Wallet
    const currentMain = user.balances.get("EUR") || 0;
    user.balances.set("EUR", currentMain + Number(amount));

    user.ledger.push({
      amount: Number(amount),
      type: "transfer",
      status: "completed",
      description: "Internal Transfer: Profit → Main Wallet (EUR)",
      createdAt: new Date(),
    });

    await user.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: "Profit successfully reinvested to Main Wallet" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

