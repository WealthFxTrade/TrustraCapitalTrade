import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  asset: { type: String, required: true, default: 'BTC' },
  address: { type: String, required: true },
  network: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  transactionHash: { type: String, default: null }
}, { timestamps: true });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
