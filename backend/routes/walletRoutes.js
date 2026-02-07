const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const walletService = require('../services/walletService');

router.get('/deposit/address', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const asset = (req.query.asset || 'BTC').toUpperCase();

    const { virtualAddress, realDepositAddress } = await walletService.getDepositAddress(userId, asset);

    // Returning success: true is vital for the frontend UI to update
    return res.json({
      success: true,
      asset,
      virtualAddress,      
      realDepositAddress   
    });
  } catch (err) {
    console.error('Wallet Route Error:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate BTC address' 
    });
  }
});

module.exports = router;

