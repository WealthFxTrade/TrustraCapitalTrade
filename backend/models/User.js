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
    password: { type: String, required: [true, 'Please add a password'], minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    balances: {
      type: Map,
      of: Number,
      default: () => new Map([
        ['EUR', 0],
        ['BTC', 0],
        ['USDT', 0],
        ['ROI', 0],
        ['INVESTED', 0],
      ]),
    },

    // 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },

    // Failed login / lockout
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Session management (hashed tokens)
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

    // KYC fields
    kycStatus: { type: String, enum: ['unverified', 'pending', 'submitted', 'verified', 'rejected'], default: 'unverified' },
    kycNotes: { type: String, default: null },
    kycVerifiedAt: { type: Date, default: null },
    idFrontUrl: { type: String, default: null },
    idBackUrl: { type: String, default: null },
    selfieUrl: { type: String, default: null },

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── PASSWORD HASHING ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── PASSWORD MATCHING ──
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── CHECK IF ACCOUNT IS LOCKED ──
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ── INCREMENT FAILED LOGIN ATTEMPTS ──
userSchema.methods.incrementFailedLogin = async function () {
  const LOCK_THRESHOLD = 5;
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= LOCK_THRESHOLD) {
    this.lockUntil = Date.now() + LOCK_TIME;
    this.failedLoginAttempts = 0;
  }

  await this.save();
};

// ── RESET FAILED LOGIN ──
userSchema.methods.resetFailedLogin = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// ── ADD SESSION (HASHED TOKEN) ──
userSchema.methods.addSession = async function (token, userAgent, ipAddress, expiresAt) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  this.sessions.push({
    token: hashedToken,
    userAgent,
    ipAddress,
    expiresAt,
  });

  await this.save();
};

// ── REMOVE SESSION ──
userSchema.methods.removeSession = async function (token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  this.sessions = this.sessions.filter((session) => session.token !== hashedToken);
  await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
