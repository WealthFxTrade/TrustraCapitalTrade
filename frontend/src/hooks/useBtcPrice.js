import { useState, useEffect } from 'react';
import axios from 'axios';

export const useBtcPrice = (updateInterval = 60000) => {
  const [price, setPrice] = useState(null);
  const [rawPrice, setRawPrice] = useState(102345); // fallback baseline
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin',
            vs_currencies: 'eur'
          }
        }
      );

      const btcEur = response.data.bitcoin.eur;

      setRawPrice(btcEur);
      setPrice(
        btcEur.toLocaleString('en-IE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0
        })
      );

      setError(null);
    } catch (err) {
      console.warn('CoinGecko fetch failed. Using fallback price.');

      const fallback = 102450;

      setRawPrice(fallback);
      setPrice(
        fallback.toLocaleString('en-IE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0
        })
      );

      if (!price) {
        setError('Live feed reconnecting...');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const intervalId = setInterval(fetchPrice, updateInterval);
    return () => clearInterval(intervalId);
  }, [updateInterval]);

  return { price, rawPrice, loading, error };
};
