import axios from 'axios';

let cachedBTCPriceEUR = 0;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * @desc Fetch BTC price in EUR from CoinGecko
 * @returns {Promise<number>} BTC price in EUR
 */
export const getBTCPriceEUR = async () => {
  const now = Date.now();

  // Return cached price if within 30 seconds
  if (now - lastFetchTime < CACHE_DURATION_MS && cachedBTCPriceEUR > 0) {
    return cachedBTCPriceEUR;
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'eur',
        },
        timeout: 5000, // 5s timeout
      }
    );

    const price = response.data?.bitcoin?.eur;

    if (!price) throw new Error('Invalid BTC price response');

    cachedBTCPriceEUR = Number(price);
    lastFetchTime = now;

    return cachedBTCPriceEUR;
  } catch (err) {
    console.error('BTC price fetch failed:', err.message);
    // fallback to cached price if available
    return cachedBTCPriceEUR || 0;
  }
};
