// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ledgerSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true }, // smallest unit: satoshi/wei
    currency: { type: String, required: true }, // e.g., BTC, ETH
    type: { type: String, enum: ['credit', 'debit'], required: true },
    source: { type: String, required: true }, // e.g., deposit, withdrawal
    referenceId: mongoose.Schema.Types.ObjectId, // link to deposit/withdrawal/tx
    description: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    plan: {
      type: String,
      enum: ['none', 'basic', 'premium', 'vip'],
      default: 'none',
      index: true,
    },

    // Multi-currency balances
    balances: {
      type: Map,
      of: Number, // smallest unit (satoshi, wei)
      default: {},
    },

    // BTC XPUB / derivation index
    btcXpub: { type: String },
    btcIndex: { type: Number, default: 0 },

    // Current deposit address for user
    btcAddress: { type: String, trim: true, sparse: true },

    // Ledger for audit
    ledger: [ledgerSchema],

    // Flags
    banned: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false, index: true },

    // Email verification
    verificationToken: String,
    verificationTokenExpires: Date,

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12); // strong enough for production
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for front-end convenience
userSchema.virtual('formattedJoinedDate').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

export default mongoose.model('User', userSchema);
