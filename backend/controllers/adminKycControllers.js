// backend/controllers/adminKycControllers.js
import mongoose from 'mongoose';
import KYC from '../models/KYC.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js'; // optional — comment out if not used

/**
 * GET /api/admin/kyc
 * Get all KYC submissions (filtered by status, paginated)
 */
export const getKycRequests = async (req, res) => {
  try {
    const { 
      status = 'pending', 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = status !== 'all' ? { status } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const kycs = await KYC.find(query)
      .populate('user', 'fullName email role')
      .sort(sort)
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
    console.error('[GET KYC REQUESTS ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC requests',
      error: err.message,
    });
  }
};

/**
 * GET /api/admin/kyc/:id
 * Get single KYC submission details
 */
export const getKycById = async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id)
      .populate('user', 'fullName email role phone')
      .populate('verifiedBy', 'fullName email')
      .lean();

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (err) {
    console.error('[GET SINGLE KYC ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC details',
      error: err.message,
    });
  }
};

/**
 * PATCH /api/admin/kyc/:id/approve
 * Approve KYC submission + mark user as verified
 */
export const approveKyc = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const kyc = await KYC.findById(req.params.id).session(session);
    if (!kyc) {
      throw new Error('KYC submission not found');
    }

    if (kyc.status !== 'pending') {
      throw new Error(`KYC already ${kyc.status}`);
    }

    // Update KYC
    kyc.status = 'approved';
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();
    await kyc.save({ session });

    // Update User
    await User.findByIdAndUpdate(
      kyc.user,
      { isVerified: true },
      { session }
    );

    // Audit log (optional)
    await AuditLog?.create([{
      admin: req.user._id,
      action: 'APPROVE_KYC',
      targetId: kyc._id,
      targetModel: 'KYC',
      metadata: { userId: kyc.user },
      ip: req.ip,
    }], { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      kyc,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[APPROVE KYC ERROR]', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to approve KYC',
    });
  } finally {
    session.endSession();
  }
};

/**
 * PATCH /api/admin/kyc/:id/reject
 * Reject KYC submission with reason
 */
export const rejectKyc = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      throw new Error('Rejection reason must be provided and meaningful');
    }

    const kyc = await KYC.findById(req.params.id).session(session);
    if (!kyc) {
      throw new Error('KYC submission not found');
    }

    if (kyc.status !== 'pending') {
      throw new Error(`KYC already ${kyc.status}`);
    }

    kyc.status = 'rejected';
    kyc.rejectionReason = reason.trim();
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();
    await kyc.save({ session });

    // Audit log (optional)
    await AuditLog?.create([{
      admin: req.user._id,
      action: 'REJECT_KYC',
      targetId: kyc._id,
      targetModel: 'KYC',
      metadata: { 
        userId: kyc.user,
        reason: reason.trim()
      },
      ip: req.ip,
    }], { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'KYC rejected successfully',
      kyc,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[REJECT KYC ERROR]', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to reject KYC',
    });
  } finally {
    session.endSession();
  }
};
