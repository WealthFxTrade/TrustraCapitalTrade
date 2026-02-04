import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/* USER BTC DEPOSIT ADDRESS */
router.get('/deposit', protect, (req, res) => {
  res.json({
    btcAddress: req.user.btcAddress,
    masterWallet: 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq',
  });
});

export default router;
