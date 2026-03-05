import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @protocol getAllWithdrawals
 * @desc    Fetches all pending and completed extraction requests across the network.
 */
export const getAllWithdrawals = async (req, res, next) => {
  try {
    // We search the ledger of all users for entries of type 'withdrawal'
    const users = await User.find({ "ledger.type": "withdrawal" })
      .select('username email ledger');

    // Flatten the ledger entries into a single list for the Admin HUD
    let allWithdrawals = [];
    users.forEach(user => {
      user.ledger.forEach(entry => {
        if (entry.type === 'withdrawal') {
          allWithdrawals.push({
            _id: entry._id,
            userId: user._id,
            username: user.username,
            email: user.email,
            amount: entry.amount,
            currency: entry.currency,
            address: entry.address,
            status: entry.status,
            createdAt: entry.createdAt
          });
        }
      });
    });

    // Sort by newest first
    allWithdrawals.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({ success: true, withdrawals: allWithdrawals });
  } catch (err) {
    next(err);
  }
};

/**
 * @protocol processWithdrawal
 * @desc    Approves or Rejects a pending extraction request.
 */
export const processWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params; // Ledger Entry ID
    const { status, adminComment } = req.body; // 'completed' or 'rejected'

    const user = await User.findOne({ "ledger._id": id });
    if (!user) throw new ApiError(404, "Transaction record not found in ledger.");

    const entry = user.ledger.id(id);
    
    if (entry.status !== 'pending') {
      throw new ApiError(400, "Transaction has already been processed.");
    }

    if (status === 'rejected') {
      // 🔄 Refund Protocol: Return the ROI to the user's balance
      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + entry.amount);
      entry.status = 'rejected';
      entry.description += ` | Rejected: ${adminComment}`;
    } else {
      entry.status = 'completed';
      entry.description += ` | Approved by Zurich HQ`;
    }

    // Log to Security Audit Trail
    await AuditLog.create({
      admin: req.user._id,
      action: `WITHDRAWAL_${status.toUpperCase()}`,
      targetUser: user._id,
      details: `Processed ${entry.amount} ${entry.currency} extraction. Result: ${status}`
    });

    await user.save();
    res.status(200).json({ success: true, message: `Extraction protocol ${status}.` });
  } catch (err) {
    next(err);
  }
};
