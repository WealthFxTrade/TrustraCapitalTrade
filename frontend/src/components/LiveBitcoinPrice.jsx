// src/components/LiveBitcoinPrice.jsx (enhanced for EUR)
const LiveBitcoinPrice = () => {
  const [priceEur, setPriceEur] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true'
        );
        const data = await res.json();
        const btc = data.bitcoin;
        setPriceEur(btc.eur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));
        setChange24h(btc.eur_24h_change.toFixed(2));
      } catch (err) {
        console.error('BTC EUR fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-gray-400 animate-pulse">Loading BTC price...</div>;

  const isPositive = change24h >= 0;

  return (
    <div className="inline-flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
      <span className="text-sm text-gray-400 uppercase tracking-wider mb-1">Bitcoin Price (EUR)</span>
      <span className="text-3xl md:text-4xl font-black text-white">{priceEur || '—'}</span>
      <span className={`text-sm font-semibold mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        24h: {isPositive ? '+' : ''}{change24h || '—'}%
      </span>
    </div>
  );
};
