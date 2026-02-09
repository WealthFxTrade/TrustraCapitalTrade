import mongoose from 'mongoose';
import KYC from '../models/KYC.js';
import User from '../models/User.js';

/**
 * Trustra Capital - Admin KYC Operations (2026)
 * Handles investor verification queue and compliance status.
 */

// @desc    Get all KYC requests with pagination
// @route   GET /api/admin/kyc
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
    console.error('[GET_KYC_REQUESTS_ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Server synchronization error' });
  }
};

// @desc    Approve Investor KYC (Atomic Transaction)
// @route   PATCH /api/admin/kyc/:id/approve
export const approveKyc = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const kyc = await KYC.findById(req.params.id).session(session);
    if (!kyc) throw new Error('KYC record not found');
    if (kyc.status !== 'pending') throw new Error(`KYC node already ${kyc.status}`);

    // 1. Update KYC status
    kyc.status = 'approved';
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();
    await kyc.save({ session });

    // 2. Synchronize User verification status
    await User.findByIdAndUpdate(
      kyc.user,
      { $set: { isVerified: true, kycVerified: true } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Investor verified for 2026 Compliance',
      kyc,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[APPROVE_KYC_ERROR]', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// @desc    Reject Investor KYC with reason
// @route   PATCH /api/admin/kyc/:id/reject
export const rejectKyc = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      throw new Error('Valid rejection reason required for audit trail');
    }

    const kyc = await KYC.findById(req.params.id).session(session);
    if (!kyc) throw new Error('KYC record not found');
    if (kyc.status !== 'pending') throw new Error(`KYC node already ${kyc.status}`);

    // Update record as rejected
    kyc.status = 'rejected';
    kyc.rejectionReason = reason.trim();
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();
    await kyc.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'KYC rejected successfully',
      kyc,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[REJECT_KYC_ERROR]', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export default { getKycRequests, approveKyc, rejectKyc };

