// backend/routes/adminKYC.js
import express from 'express';
import mongoose from 'mongoose';
import KYC from '../models/KYC.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(protect, admin);

/**
 * GET /api/admin/kyc/pending
 * List all pending KYC submissions
 */
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const submissions = await KYC.find({ status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await KYC.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      submissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin pending KYC error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch pending KYC' });
  }
});

/**
 * GET /api/admin/kyc/:id
 * Get full KYC submission details
 */
router.get('/:id', async (req, res) => {
  try {
    const submission = await KYC.findById(req.params.id)
      .populate('user', 'fullName email role')
      .lean();

    if (!submission) {
      return res.status(404).json({ success: false, message: 'KYC submission not found' });
    }

    res.json({
      success: true,
      submission,
    });
  } catch (err) {
    console.error('Admin KYC detail error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/kyc/:id/approve
 * Approve KYC submission + update user verification
 */
router.patch('/:id/approve', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const submission = await KYC.findById(req.params.id).session(session);
    if (!submission) throw new Error('KYC submission not found');

    if (submission.status !== 'pending') {
      throw new Error(`KYC already ${submission.status}`);
    }

    const user = await User.findById(submission.user).session(session);
    if (!user) throw new Error('User not found');

    submission.status = 'approved';
    submission.verifiedBy = req.user._id;
    submission.verifiedAt = new Date();
    await submission.save({ session });

    user.isVerified = true;
    await user.save({ session });

    // Audit log
    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'APPROVE_KYC',
        targetId: submission._id,
        targetModel: 'KYC',
        metadata: {
          userId: user._id,
          email: user.email,
          documentType: submission.documentType,
        },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'KYC approved successfully',
      submission,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Approve KYC error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * PATCH /api/admin/kyc/:id/reject
 * Reject KYC submission with reason
 */
router.patch('/:id/reject', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      throw new Error('Rejection reason is required and must be meaningful');
    }

    const submission = await KYC.findById(req.params.id).session(session);
    if (!submission) throw new Error('KYC submission not found');

    if (submission.status !== 'pending') {
      throw new Error(`KYC already ${submission.status}`);
    }

    submission.status = 'rejected';
    submission.rejectionReason = rejectionReason.trim();
    submission.verifiedBy = req.user._id;
    submission.verifiedAt = new Date();
    await submission.save({ session });

    // Audit log
    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'REJECT_KYC',
        targetId: submission._id,
        targetModel: 'KYC',
        metadata: {
          userId: submission.user,
          reason: rejectionReason,
        },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'KYC rejected',
      submission,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Reject KYC error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * GET /api/admin/kyc/stats
 * KYC overview stats for dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalSubmissions,
      pending,
      approved,
      rejected,
    ] = await Promise.all([
      KYC.countDocuments(),
      KYC.countDocuments({ status: 'pending' }),
      KYC.countDocuments({ status: 'approved' }),
      KYC.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      stats: {
        total: totalSubmissions,
        pending,
        approved,
        rejected,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('KYC stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load KYC stats' });
  }
});

export default router;
