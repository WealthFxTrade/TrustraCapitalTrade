// backend/controllers/adminKycController.js
import mongoose from 'mongoose';
import KYC from '../models/KYC.js';  // ← use uppercase KYC
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js'; // optional – remove if you don't have it

// GET /api/admin/kyc?status=pending
export const getKycRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    const kycs = await KYC.find(query)
      .populate('user', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await KYC.countDocuments(query);

    res.status(200).json({
      success: true,
      count: kycs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: kycs,
    });
  } catch (err) {
    console.error('[GET KYC REQUESTS ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching KYC requests' });
  }
};

// PATCH /api/admin/kyc/:id/approve
export const approveKyc = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const kyc = await KYC.findById(req.params.id).session(session);
    if (!kyc) {
      throw new Error('KYC record not found');
    }

    if (kyc.status !== 'pending') {
      throw new Error(`KYC already ${kyc.status}`);
    }

    kyc.status = 'approved';
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();
    await kyc.save({ session });

    // Update user verification status
    await User.findByIdAndUpdate(
      kyc.user,
      { kycVerified: true },
      { session }
    );

    // Optional audit log
    if (AuditLog) {
      await AuditLog.create([{
        admin: req.user._id,
        action: 'APPROVE_KYC',
        targetId: kyc._id,
        targetModel: 'KYC',
        metadata: { userId: kyc.user },
        ip: req.ip,
      }], { session });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      kyc,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[APPROVE KYC ERROR]', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// PATCH /api/admin/kyc/:id/reject
export const rejectKyc = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      throw new Error('Rejection reason is required and must be meaningful');
    }

    const kyc = await KYC.findById(req.params.id).session(session);
    if (!kyc) {
      throw new Error('KYC record not found');
    }

    if (kyc.status !== 'pending') {
      throw new Error(`KYC already ${kyc.status}`);
    }

    kyc.status = 'rejected';
    kyc.rejectionReason = reason.trim();
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();
    await kyc.save({ session });

    // Optional audit log
    if (AuditLog) {
      await AuditLog.create([{
        admin: req.user._id,
        action: 'REJECT_KYC',
        targetId: kyc._id,
        targetModel: 'KYC',
        metadata: { userId: kyc.user, reason },
        ip: req.ip,
      }], { session });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'KYC rejected successfully',
      kyc,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[REJECT KYC ERROR]', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};
