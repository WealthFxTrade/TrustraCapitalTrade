import express from 'express';
import { uploadKyc } from '../middleware/uploadMiddleware.js';
import { submitKyc } from '../controllers/kycController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/upload',
  protect,
  uploadKyc.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
  ]),
  submitKyc
);

export default router;

