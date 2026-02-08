import mongoose from 'mongoose';

const BtcAddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true, unique: true },
  index: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('BtcAddress', BtcAddressSchema);
