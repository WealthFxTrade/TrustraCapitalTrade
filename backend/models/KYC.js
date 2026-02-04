// backend/models/KYC.js
import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,           // ← added: one active KYC per user
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

    frontImage: {
      type: String,
      required: [true, 'Front image is required'],
    },

    backImage: {
      type: String,
    },

    selfieImage: {
      type: String,
      required: [true, 'Selfie is required'],
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason too long'],
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },

    verifiedAt: {
      type: Date,
      sparse: true,
    },

    // Optional — can be used later for OCR/face-match score, IP, device info, etc.
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

// Virtual: days since submission (useful in admin UI)
kycSchema.virtual('daysPending').get(function () {
  if (this.status !== 'pending') return 0;
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Compound indexes for common admin queries
kycSchema.index({ status: 1, createdAt: -1 });
kycSchema.index({ user: 1, status: 1 });

export default mongoose.model('KYC', kycSchema);
