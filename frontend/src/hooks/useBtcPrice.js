import { useState, useEffect } from 'react';
import axios from 'axios';

export const useBtcPrice = (updateInterval = 300000) => {  // Default: 5 mins to avoid rate limits
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    try {
      // Don't set loading to true on background refreshes to avoid UI flickering
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      
      const btcUsd = response.data.bitcoin.usd;
      setPrice(btcUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      setError(null);
    } catch (err) {
      console.warn('BTC Fetch failed. Using Feb 2026 fallback.');
      
      // Fallback price for Feb 2, 2026
      const fallback = 77494;
      setPrice(fallback.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      
      // Only set error if we have no price at all
      if (!price) setError('Market data delayed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();

    const intervalId = setInterval(fetchPrice, updateInterval);
    return () => clearInterval(intervalId);
  }, [updateInterval]);

  return { price, loading, error };
};

