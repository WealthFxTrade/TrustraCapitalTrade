const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET BTC price
router.get('/btc-price', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    );
    res.json(response.data); // { symbol: "BTCUSDT", price: "77494.12" }
  } catch (err) {
    console.error('BTC price fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch BTC price' });
  }
});

module.exports = router;
