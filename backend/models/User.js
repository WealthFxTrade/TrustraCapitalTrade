import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  balance: { type: Number, default: 0 },
  plan: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
