import KYC from '../models/KYC.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @protocol submitKyc
 * @desc    Submit Identity Nodes for Zurich HQ Validation
 * @route   POST /api/user/kyc-submit
 * @access  Private
 */
export const submitKyc = async (req, res, next) => {
  try {
    const { documentType, documentNumber } = req.body;
    const userId = req.user._id;

    // 1. Verification Protocol: Check for existing verified status
    const existingKyc = await KYC.findOne({ user: userId });
    if (existingKyc && existingKyc.status === 'verified') {
      throw new ApiError(400, "Identity already verified in the master protocol.");
    }

    // 2. Data Integrity: Validate Physical Identity Nodes (Files)
    // Front and Selfie are mandatory for 2026 compliance
    if (!req.files || !req.files.frontImage || !req.files.selfieImage) {
      throw new ApiError(400, "Identity nodes missing: Front Image and Selfie are required.");
    }

    // 3. Create KYC Audit Record
    // Note: req.files contains local paths provided by Multer middleware
    const kycData = {
      user: userId,
      documentType,
      documentNumber,
      frontImage: req.files.frontImage[0].path,
      selfieImage: req.files.selfieImage[0].path,
      backImage: req.files.backImage ? req.files.backImage[0].path : null,
      status: 'pending',
      submittedAt: new Date()
    };

    let kycRecord;
    if (existingKyc) {
      // Update existing record if previous attempt failed
      kycRecord = await KYC.findByIdAndUpdate(existingKyc._id, kycData, { new: true });
    } else {
      kycRecord = await KYC.create(kycData);
    }

    // 4. Synchronize User Model Status
    // We update the user document directly so the frontend 'isVerified' check is instant
    await User.findByIdAndUpdate(userId, {
      'kyc.status': 'pending',
      'kyc.reference': kycRecord._id,
      isVerified: false // Remains false until Zurich HQ approves
    });

    res.status(201).json({
      success: true,
      message: 'Identity transmitted successfully. Awaiting Zurich HQ validation.',
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @protocol getKycStatus
 * @desc    Fetch current node's verification status
 * @route   GET /api/user/kyc-status
 * @access  Private
 */
export const getKycStatus = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id })
      .select('status submittedAt comment')
      .sort({ submittedAt: -1 });

    if (!kyc) {
      return res.status(200).json({ 
        success: true, 
        status: 'unverified',
        message: 'No identity packets found on this node.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      status: kyc.status, 
      submittedAt: kyc.submittedAt,
      comment: kyc.comment // Admins can leave feedback if rejected
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @protocol adminUpdateKyc (HQ Exclusive)
 * @desc    Approve or Reject KYC status from the Admin Panel
 * @access  Admin Only
 */
export const adminUpdateKyc = async (req, res, next) => {
  try {
    const { kycId, status, comment } = req.body;

    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new ApiError(404, "KYC node not found.");

    kyc.status = status;
    kyc.comment = comment;
    await kyc.save();

    // If approved, update the main user model
    if (status === 'verified') {
      await User.findByIdAndUpdate(kyc.user, { 
        isVerified: true, 
        'kyc.status': 'verified' 
      });
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(kyc.user, { 
        isVerified: false, 
        'kyc.status': 'rejected' 
      });
    }

    res.status(200).json({ success: true, message: `Node updated to: ${status}` });
  } catch (error) {
    next(error);
  }
};
