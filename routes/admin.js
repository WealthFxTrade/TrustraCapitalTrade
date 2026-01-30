// backend/routes/admin.js
import express from 'express';
import mongoose from 'mongoose';
import { protect, admin } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// All routes below require authentication + admin role
router.use(protect, admin);

/**
 * GET /api/admin/deposits/pending
 * List all pending deposits
 */
router.get('/deposits/pending', async (req, res) => {
  try {
    const deposits = await Transaction.find({
      type: 'deposit',
      status: 'pending',
    })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: deposits.length,
      deposits,
    });
  } catch (err) {
    console.error('Pending deposits error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/deposits/:id
 * Approve, reject, or fail a deposit (atomic + audited)
 */
router.patch('/deposits/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, adminNote } = req.body;

    // Validate status
    if (!['approved', 'rejected', 'failed'].includes(status)) {
      throw new Error('Invalid status. Allowed: approved, rejected, failed');
    }

    // Find deposit
    const deposit = await Transaction.findById(req.params.id).session(session);
    if (!deposit || deposit.type !== 'deposit') {
      throw new Error('Deposit not found');
    }

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit already ${deposit.status}`);
    }

    // Approve → credit balance
    if (status === 'approved') {
      const user = await User.findById(deposit.user).session(session);
      if (!user) throw new Error('User not found');

      user.balance += deposit.amount;
      await user.save({ session });
    }

    // Update deposit
    deposit.status = status;
    if (adminNote) deposit.adminNote = adminNote.trim();
    await deposit.save({ session });

    // Audit log entry
    await AuditLog.create(
      [
        {
          admin: req.user._id,
          action:
            status === 'approved'
              ? 'APPROVE_DEPOSIT'
              : status === 'rejected'
              ? 'REJECT_DEPOSIT'
              : 'FAIL_DEPOSIT',
          targetId: deposit._id,
          targetModel: 'Transaction',
          metadata: {
            amount: deposit.amount,
            userId: deposit.user,
            note: adminNote || null,
          },
          ip: req.ip,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Deposit marked as ${status}`,
      deposit,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Deposit update error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
