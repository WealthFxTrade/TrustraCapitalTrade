// backend/models/KYC.js
import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },

    documentType: {
      type: String,
      enum: ['passport', 'national_id', 'drivers_license', 'other'],
      required: true,
    },

    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    frontImage: {
      type: String, // URL to cloud storage (Cloudinary, S3, etc.)
      required: true,
    },

    backImage: {
      type: String,
      required: false,
    },

    selfieImage: {
      type: String,
      required: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },

    verifiedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('KYC', kycSchema);
