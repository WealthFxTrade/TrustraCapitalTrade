import mongoose from 'mongoose';

/**
 * Trustra Capital - Audit Log Model (Rio Series 2026)
 * Records high-integrity administrative actions for platform transparency.
 */
const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is mandatory for audit'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action type is mandatory'],
      uppercase: true, // Standardizes 'APPROVE_KYC' vs 'approve_kyc'
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is mandatory'],
      index: true,
    },
    targetModel: {
      type: String,
      required: [true, 'Target Model reference is mandatory'],
      enum: ['User', 'KYC', 'Withdrawal', 'Deposit'], // Safety constraint
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  { 
    timestamps: true 
  }
);

// Optimize for "Latest Actions" sorting in the Admin Panel
auditLogSchema.index({ createdAt: -1 });

// Prevent accidental deletion or modification of logs via middleware
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be modified.'));
  }
  next();
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

