/**
 * Trustra Capital Trade - Admin Routes
 * Final Production Alignment with AdminDashboard.jsx
 */

import express from 'express';
import {
  getPlatformStats,       // Mapped to /health
  getAllUsers,
  updateUserStatus,       // Handles /users/:id/:action
  getPendingKYCs,         // Mapped to /kyc
  updateKYCStatus,
  triggerYieldDistribution
} from '../controllers/adminController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 🛡️ SECURITY LAYER
 * Ensure req.user exists and has role: 'admin'
 */
router.use(protect);
router.use(admin);

// ── 📊 SYSTEM HEALTH & ANALYTICS ──
// Dashboard calls api.get('/admin/health') for stats
router.get('/health', getPlatformStats); 
router.get('/stats', getPlatformStats); // Alias for redundancy

// ── 👥 NODE / USER REGISTRY ──
router.get('/users', getAllUsers);

// Dashboard calls api.put(`/admin/users/${userId}/${action}`)
// This single route handles both 'ban' and 'activate' via the controller logic
router.put('/users/:id/:action', updateUserStatus);

// ── 🪪 KYC OVERSIGHT ──
// Dashboard calls api.get('/admin/kyc')
router.get('/kyc', getPendingKYCs);
router.put('/kyc/update', updateKYCStatus);

// ── ⚡ PROTOCOL ACTIONS ──
// Dashboard calls api.post('/admin/health') via the "Zap" button
router.post('/health', triggerYieldDistribution);
router.post('/trigger-yield', triggerYieldDistribution);

export default router;

