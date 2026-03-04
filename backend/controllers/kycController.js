import KYC from '../models/KYC.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Submit KYC Identity Nodes (User)
 * @route   POST /api/user/kyc/submit
 * @access  Private
 */
export const submitKyc = async (req, res, next) => {
  try {
    const { documentType, documentNumber } = req.body;
    const userId = req.user._id;

    // 1. Check for existing verified status to prevent redundant uploads
    const existingKyc = await KYC.findOne({ user: userId });
    if (existingKyc && existingKyc.status === 'verified') {
      throw new ApiError(400, "Identity already verified in the protocol.");
    }

    // 2. Validate Physical Identity Nodes (Files)
    if (!req.files || !req.files.frontImage || !req.files.selfieImage) {
      throw new ApiError(400, "Identity nodes missing: Front Image and Selfie are mandatory.");
    }

    // 3. Create KYC Audit Record
    // Assuming your Multer config is set to Cloudinary or local storage
    const kycRecord = await KYC.create({
      user: userId,
      documentType,
      documentNumber,
      frontImage: req.files.frontImage[0].path,
      selfieImage: req.files.selfieImage[0].path,
      backImage: req.files.backImage ? req.files.backImage[0].path : null,
      status: 'pending',
      submittedAt: new Date()
    });

    // 4. Synchronize User Model Status
    // This allows the 'Withdrawal' check to see the status without querying the KYC collection
    await User.findByIdAndUpdate(userId, {
      'kyc.status': 'pending',
      'kyc.reference': kycRecord._id
    });

    res.status(201).json({ 
      success: true, 
      message: 'Identity transmitted successfully. Awaiting terminal validation.', 
      kycRecord 
    });
  } catch (error) {
    // Pass to global error handler to maintain "Protocol" JSON format
    next(error);
  }
};

/**
 * @desc    Get current user's KYC status
 * @route   GET /api/user/kyc/status
 * @access  Private
 */
export const getKycStatus = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    if (!kyc) {
      return res.status(200).json({ success: true, status: 'unverified' });
    }
    res.status(200).json({ success: true, status: kyc.status, details: kyc });
  } catch (error) {
    next(error);
  }
};
