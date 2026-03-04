import express from 'express';
import {
  getUserProfile,
  getMyDepositAddress,
  updatePassword,
  getYieldHistory,
  getAllUsers,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { submitKyc, getKycStatus } from '../controllers/kycController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerConfig.js';

const router = express.Router();

// ── 1. CORE USER PROTOCOLS (Protected) ──
router.use(protect);

router.get('/profile', getUserProfile);
router.get('/yield-history', getYieldHistory);
router.get('/deposit-address', getMyDepositAddress);
router.put('/update-password', updatePassword);

// ── 2. IDENTITY (KYC) INGRESS ──
const kycFields = upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]);
router.post('/kyc-submit', kycFields, submitKyc);
router.get('/kyc-status', getKycStatus);

// ── 3. ADMINISTRATIVE OVERRIDE (Protected + Admin) ──
router.get('/all', admin, getAllUsers);
router.route('/:id')
  .put(admin, updateUser)
  .delete(admin, deleteUser);

export default router;
