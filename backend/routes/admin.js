// backend/routes/admin.js
// ... existing imports and code ...

/**
 * GET /api/admin/deposits/pending
 * List all pending deposits
 */
router.get('/deposits/pending', async (req, res) => {
  try {
    const deposits = await Transaction.find({
      type: 'deposit',
      status: 'pending'
    })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: deposits.length,
      deposits,
    });
  } catch (err) {
    console.error('Pending deposits error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/deposits/:id
 * Admin approves/rejects a deposit
 */
router.patch('/deposits/:id', async (req, res) => {
  const { status, adminNote } = req.body;

  if (!['completed', 'rejected', 'failed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Allowed: completed, rejected, failed',
    });
  }

  try {
    const deposit = await Transaction.findById(req.params.id);
    if (!deposit || deposit.type !== 'deposit') {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Deposit already ${deposit.status}`,
      });
    }

    deposit.status = status;
    if (adminNote) deposit.adminNote = adminNote.trim();

    // If approved → add to user balance
    if (status === 'completed') {
      const user = await User.findById(deposit.user);
      if (user) {
        user.balance += deposit.amount;
        await user.save();
      }
    }

    await deposit.save();

    res.json({
      success: true,
      message: `Deposit marked as ${status}`,
      deposit,
    });
  } catch (err) {
    console.error('Deposit update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
