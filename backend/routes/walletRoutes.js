const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const walletService = require('../services/walletService');

router.get('/deposit/address', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Default to BTC if the user clicked the button without a query param
    const asset = (req.query.asset || 'BTC').toUpperCase();

    const { virtualAddress, realDepositAddress } = await walletService.getDepositAddress(userId, asset);

    // success: true is critical for the frontend to hide the error message
    res.json({
      success: true,
      asset,
      virtualAddress,      
      realDepositAddress   
    });
  } catch (err) {
    console.error(`Error generating address for user ${req.user.id}:`, err.message);
    // If we reach here, the UI will show "Failed to generate BTC address"
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate BTC address' 
    });
  }
});

module.exports = router;

