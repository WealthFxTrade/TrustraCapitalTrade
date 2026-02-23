import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  seq: {
    type: Number,
    default: 0
  }
}, {
  timestamps: false,
  versionKey: false
});

// Clear cached model in dev (hot-reload safe)
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Counter;
}

export default mongoose.model('Counter', counterSchema);
