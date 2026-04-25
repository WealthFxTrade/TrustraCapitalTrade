import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phoneNumber: {
    type: String,
    default: null
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },

  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },

  address_index: {
    type: Number,
    unique: true,
    sparse: true
  },

  /**
   * 💰 BALANCE ENGINE (LOCKED SYSTEM)
   */
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

  /**
   * 🔐 WALLET SYSTEM
   */
  walletAddresses: {
    BTC: { type: String, default: '' },
    ETH: { type: String, default: '' },
    USDT: { type: String, default: '' },
  },

  /**
   * 📈 INVESTMENT
   */
  investment: {
    startDate: Date,
    maturityDate: Date,
    lockPeriodMonths: { type: Number, default: 12 },
    lastYieldAt: Date
  },

  activePlan: {
    type: String,
    default: 'None'
  },

  /**
   * 🪪 KYC
   */
  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'submitted', 'verified', 'rejected'],
    default: 'unverified'
  },

  /**
   * 🔐 SECURITY
   */
  twoFactorEnabled: { type: Boolean, default: false },

},
{
  timestamps: true
}
);

/**
 * 🔐 HASH PASSWORD
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * 🔑 MATCH PASSWORD
 */
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

/**
 * ⚡ AUTO PLAN
 */
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

export default mongoose.model('User', userSchema);
