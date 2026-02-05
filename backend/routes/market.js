import express from 'express';
import axios from 'axios';

const router = express.Router();

// Fallback price in case the first call fails
let cachedPrice = { val: 77494, time: 0 };

/**
 * @route   GET /api/market/btc-price
 * @desc    Fetch current BTC/USD price
 */
router.get('/btc-price', async (req, res) => {
  const now = Date.now();
  if (now - cachedPrice.time < 60000) {
    return res.json({ success: true, price: cachedPrice.val });
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com',
      { headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY } }
    );

    const price = response.data.bitcoin.usd;
    cachedPrice = { val: price, time: now };

    res.json({ success: true, price });
  } catch (err) {
    console.error('[MARKET API ERROR]', err.message);
    res.json({ success: true, price: cachedPrice.val, source: 'fallback' });
  }
});

/**
 * @route   GET /api/market/btc-history
 * @desc    Fetch 30-day price history for charts
 */
router.get('/btc-history', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com',
      { headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY } }
    );

    // Extract only the price values [timestamp, price] -> price
    const history = response.data.prices.map(p => p[1]);
    res.json({ success: true, history });
  } catch (err) {
    console.error('[HISTORY API ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Market data unavailable' });
  }
});

export default router;

