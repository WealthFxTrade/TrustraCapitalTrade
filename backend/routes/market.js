import express from 'express';
import axios from 'axios';
const router = express.Router();

// Simple in-memory cache
let cachedPrice = null;
let cachedTime = null;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * @desc    Get live BTC price in EUR
 * @route   GET /api/market/btc
 */
router.get('/btc', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached price if still valid
    if (cachedPrice && cachedTime && now - cachedTime < CACHE_DURATION_MS) {
      return res.json(cachedPrice);
    }

    // Fetch from CoinGecko
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'eur',
          include_24hr_change: true
        }
      }
    );

    const data = {
      currency: 'EUR',
      price: response.data.bitcoin.eur,
      change24h: response.data.bitcoin.eur_24h_change
    };

    // Update cache
    cachedPrice = data;
    cachedTime = now;

    res.json(data);
  } catch (err) {
    console.error('Failed to fetch BTC price:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch BTC price' });
  }
});

export default router;
