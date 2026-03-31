// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false // 🛡️ Security: Never include password in queries by default
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },

  balances: {
    type: Map,
    of: Number,
    default: () => new Map([
      ['EUR', 0],
      ['BTC', 0],
      ['USDT', 0],
      ['ROI', 0],
      ['INVESTED', 0]
    ])
  },

  isNodeActive: { type: Boolean, default: false },
  activePlan: { type: String, default: 'None' },

  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'submitted', 'verified', 'rejected'],
    default: 'unverified'
  },
  kycNotes: { type: String, default: null },
  kycVerifiedAt: { type: Date, default: null },
  idFrontUrl: { type: String, default: null },
  idBackUrl: { type: String, default: null },
  selfieUrl: { type: String, default: null },

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// NOTE: We removed userSchema.pre('save') and matchPassword 
// to prevent double-hashing. Logic is now in middleware/utils.

const User = mongoose.model('User', userSchema);
export default User;

