import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch BTC price in EUR.
 * @param {number} intervalMs - Polling interval in milliseconds.
 * @returns {number|null} btcPrice
 */
export function useBtcPrice(intervalMs = 60_000) {
  const [btcPrice, setBtcPrice] = useState(null);

  const fetchBtcPrice = async () => {
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: { ids: 'bitcoin', vs_currencies: 'eur' },
      });
      const price = res?.data?.bitcoin?.eur;
      if (typeof price === 'number') {
        setBtcPrice(price);
      }
    } catch (err) {
      console.error('BTC price fetch failed:', err);
      setBtcPrice(null); // fallback
    }
  };

  useEffect(() => {
    fetchBtcPrice(); // fetch immediately
    const timer = setInterval(fetchBtcPrice, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return btcPrice;
}
