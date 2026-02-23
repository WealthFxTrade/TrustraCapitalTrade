import express from 'express';
import { protect } from '../middleware/auth.js';
import { getOrCreateBtcDepositAddress } from '../services/addressService.js';

const router = express.Router();

/**
 * @route   GET /api/bitcoin/deposit
 * @desc    Retrieves the unique BTC address for the user, creating it if necessary.
 */
router.get('/deposit', protect, async (req, res, next) => {
  try {
    // 1. Logic: Use the service to either fetch the existing address 
    // or derive a new one from the global index counter.
    const btcAddress = await getOrCreateBtcDepositAddress(req.user._id);

    // 2. Response: Send the unique address and the admin hot wallet reference
    res.json({
      success: true,
      btcAddress: btcAddress,
      // This is your master aggregation wallet
      masterWallet: 'bc1qj4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq',
      network: 'Bitcoin (Native SegWit)',
      instructions: 'Send only BTC to this address. Funds will be credited after 3 confirmations.'
    });
  } catch (err) {
    // Passes errors (like XPUB missing) to your global error handler in app.js
    next(err);
  }
});

export default router;

