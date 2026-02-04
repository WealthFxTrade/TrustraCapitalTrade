// backend/routes/adminAudit.js
import express from 'express';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin privileges
router.use(protect, admin);

/**
 * GET /api/admin/audit
 * List audit logs (paginated, searchable by action/target/admin, filter by date)
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      action = '',
      fromDate,
      toDate,
    } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    // Search by action, target email, or admin email
    if (search.trim()) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { 'metadata.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by specific action
    if (action.trim()) {
      query.action = action.trim();
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const logs = await AuditLog.find(query)
      .populate('admin', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin audit list error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

/**
 * GET /api/admin/audit/:id
 * Get single audit log entry details
 */
router.get('/:id', async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('admin', 'fullName email')
      .lean();

    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.json({
      success: true,
      log,
    });
  } catch (err) {
    console.error('Admin audit detail error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/admin/audit/export
 * Export recent audit logs as CSV (last 1000 or filtered)
 */
router.get('/export', async (req, res) => {
  try {
    const { limit = 1000 } = req.query;

    const logs = await AuditLog.find()
      .populate('admin', 'email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Simple CSV generation
    const headers = ['Timestamp', 'Admin Email', 'Action', 'Target ID', 'Target Model', 'IP', 'Metadata'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.admin?.email || 'System',
      log.action,
      log.targetId,
      log.targetModel,
      log.ip || 'N/A',
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (err) {
    console.error('Audit export error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to export audit logs' });
  }
});

export default router;
