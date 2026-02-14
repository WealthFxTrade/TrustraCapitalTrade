import { useState, useEffect } from 'react';

export default function BtcPrice({ className = '' }) {
  const [btcPrice, setBtcPrice] = useState(null);

  const fetchBtcPrice = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.bitcoin?.eur) setBtcPrice(data.bitcoin.eur);
      }
    } catch (err) {
      console.error('BTC Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {btcPrice ? `€${btcPrice.toLocaleString()}` : '---'}
    </span>
  );
}
