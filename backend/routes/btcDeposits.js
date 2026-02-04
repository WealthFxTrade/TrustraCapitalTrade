import express from 'express';
import Deposit from '../models/Deposit.js';
import { deriveAddress } from '../config/bitcoin.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/deposits/btc
 * Get or generate BTC deposit address
 */
router.get('/btc', auth, async (req, res) => {
  const fresh = req.query.fresh === 'true';

  let deposit = !fresh
    ? await Deposit.findOne({
        user: req.user.id,
        currency: 'BTC',
        status: { $in: ['pending', 'confirming'] },
      }).sort({ createdAt: -1 })
    : null;

  if (!deposit) {
    const index = Date.now(); // deterministic enough for XPUB derivation
    const address = deriveAddress(index);

    deposit = await Deposit.create({
      user: req.user.id,
      currency: 'BTC',
      address,
    });
  }

  res.json({ success: true, data: deposit });
});

/**
 * GET /api/deposits/btc/history
 */
router.get('/btc/history', auth, async (req, res) => {
  const deposits = await Deposit.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: deposits });
});

export default router;
