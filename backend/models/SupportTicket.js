import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'kyc', 'investment', 'technical', 'other'], 
    default: 'technical' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  messages: [{
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    text: { 
      type: String, 
      required: true 
    },
    attachment: { 
      type: String // Cloudinary Secure URL
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true 
});

// Index for faster admin searching
supportTicketSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.model('SupportTicket', supportTicketSchema);
