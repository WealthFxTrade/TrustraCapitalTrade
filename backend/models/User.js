import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'], trim: true },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    },
    // --- ADDED FIELD ---
    phoneNumber: { type: String, default: null, trim: true },
    // -------------------
    password: { type: String, required: [true, 'Please add a password'], minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    balances: {
      type: Map,
      of: Number,
      default: () => new Map([
        ['EUR', 0], ['BTC', 0], ['USDT', 0], ['ROI', 0], ['INVESTED', 0],
      ]),
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    sessions: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        userAgent: String,
        ipAddress: String,
        expiresAt: Date,
      },
    ],
    activePlan: { type: String, default: 'None' },
    kycStatus: { type: String, enum: ['unverified', 'pending', 'submitted', 'verified', 'rejected'], default: 'unverified' },
    kycNotes: { type: String, default: null },
    kycVerifiedAt: { type: Date, default: null },
    idFrontUrl: { type: String, default: null },
    idBackUrl: { type: String, default: null },
    selfieUrl: { type: String, default: null },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.incrementFailedLogin = async function () {
  const LOCK_THRESHOLD = 5;
  const LOCK_TIME = 30 * 60 * 1000;
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= LOCK_THRESHOLD) {
    this.lockUntil = Date.now() + LOCK_TIME;
    this.failedLoginAttempts = 0;
  }
  await this.save();
};

userSchema.methods.resetFailedLogin = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
