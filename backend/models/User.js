import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const planReturns = {
  'Rio Starter': 0.075,
  'Rio Basic': 0.105,
  'Rio Standard': 0.14,
  'Rio Advanced': 0.18,
  'Rio Elite': 0.225
};

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  balance: { type: Number, default: 0, min: 0 },
  plan: { type: String, enum: ['None', ...Object.keys(planReturns)], default: 'None' },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  kycStatus: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  btcIndex: { type: Number, default: 0 },
  btcAddress: { type: String, default: '' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual dailyRate
userSchema.virtual('dailyRate').get(function() {
  if (!this.plan || this.plan === 'None') return 0;
  return planReturns[this.plan] / 30;
});

// Hash password
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
