import mongoose from 'mongoose';

/**
 * Trustra Capital - Identity Verification Model (Rio Series 2026)
 * Handles high-integrity KYC data, document references, and audit timestamps.
 */
const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Node ID is required'],
      unique: true, // One active KYC lifecycle per user
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    documentType: {
      type: String,
      enum: ['passport', 'national_id', 'drivers_license', 'other'],
      required: [true, 'Document type is required'],
    },
    documentNumber: {
      type: String,
      required: [true, 'Document number is required'],
      trim: true,
      minlength: [4, 'Document number too short'],
      maxlength: [50, 'Document number too long'],
    },
    // Storage paths for Multer/S3
    frontImage: {
      type: String,
      required: [true, 'Front document image is required'],
    },
    backImage: {
      type: String,
    },
    selfieImage: {
      type: String,
      required: [true, 'Identity selfie is required'],
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason exceeds character limit'],
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Calculate days in queue for Admin priority sorting
kycSchema.virtual('daysPending').get(function () {
  if (this.status !== 'pending' && this.status !== 'under_review') return 0;
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual: Boolean check for frontend UI logic
kycSchema.virtual('isApproved').get(function () {
  return this.status === 'approved';
});

// Compound indexes for high-performance Admin queries
kycSchema.index({ status: 1, createdAt: -1 });
kycSchema.index({ user: 1, status: 1 });

const KYC = mongoose.models.KYC || mongoose.model('KYC', kycSchema);
export default KYC;

