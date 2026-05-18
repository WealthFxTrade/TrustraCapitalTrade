// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },

    phoneNumber: {
      type: String,
      default: null,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },

    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    address_index: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // ==================== BALANCES ====================
    balances: {
      EUR: { type: Number, default: 0 },
      BTC: { type: Number, default: 0 },
      ETH: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },

      LOCKED_EUR: { type: Number, default: 0 },
      LOCKED_BTC: { type: Number, default: 0 },
      LOCKED_ETH: { type: Number, default: 0 },
      LOCKED_USDT: { type: Number, default: 0 },

      INVESTED: { type: Number, default: 0 },
      TOTAL_PROFIT: { type: Number, default: 0 },
    },

    // ==================== WALLETS ====================
    walletAddresses: {
      BTC: { type: String, default: '' },
      ETH: { type: String, default: '' },
      USDT: { type: String, default: '' },
    },

    // ==================== INVESTMENT ====================
    activePlan: {
      type: String,
      default: 'None',
    },

    investment: {
      startDate: Date,
      maturityDate: Date,
      lockPeriodMonths: { type: Number, default: 12 },
      lastYieldAt: Date,
    },

    // ==================== KYC ====================
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'submitted', 'verified', 'rejected'],
      default: 'unverified',
    },

    // ==================== SECURITY ====================
    twoFactorEnabled: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tokenVersion: { type: Number, default: 0 },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

/* ====================== MIDDLEWARE ====================== */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function (next) {
  const invested = this.balances?.INVESTED || 0;

  if (invested >= 50000) this.activePlan = 'Tier V: Sovereign';
  else if (invested >= 15000) this.activePlan = 'Tier IV: Institutional';
  else if (invested >= 5000) this.activePlan = 'Tier III: Prime';
  else if (invested >= 1000) this.activePlan = 'Tier II: Core';
  else if (invested >= 100) this.activePlan = 'Tier I: Entry';
  else this.activePlan = 'None';

  next();
});

/* ====================== METHODS ====================== */

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken;
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phoneNumber: this.phoneNumber,
    role: this.role,
    kycStatus: this.kycStatus,
    isActive: this.isActive,
    balances: this.balances,
    activePlan: this.activePlan,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
