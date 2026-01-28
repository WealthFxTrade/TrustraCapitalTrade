// src/components/Landing.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  useEffect(() => {
    const updateBtcPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        const widget = document.getElementById('btc-price-widget');
        if (widget) {
          widget.innerHTML = `1 BTC = $${data.bitcoin.usd.toLocaleString()}`;
        }
      } catch (e) {
        const widget = document.getElementById('btc-price-widget');
        if (widget) {
          widget.innerHTML = 'Price unavailable';
        }
      }
    };

    updateBtcPrice();
    const interval = setInterval(updateBtcPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-400">TrustraCapital</div>
          <div className="flex items-center gap-6">
            <Link to="#plans" className="hover:text-indigo-400 transition">Plans</Link>
            <Link to="#reviews" className="hover:text-indigo-400 transition">Reviews</Link>
            <Link to="/login" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Login</Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500 rounded-lg transition">Register</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-gray-900 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Invest in Bitcoin with <span className="text-indigo-400">Confidence</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Since 2016, we have helped thousands of investors grow their capital through secure, automated trading strategies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-xl shadow-lg shadow-indigo-500/20 transition-all">
              Get Started Now
            </Link>
            <Link to="#plans" className="px-10 py-5 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl font-bold text-xl transition-all">
              View Investment Plans
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            Audited & Secure System Since 2016
          </p>
        </div>
      </section>

      {/* Bitcoin Live Price */}
      <section className="py-12 bg-gray-900 border-t border-gray-800 text-center">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-2">Live Bitcoin Market Price</h2>
        <div id="btc-price-widget" className="text-5xl font-mono font-bold text-green-400">Loading...</div>
        <p className="mt-2 text-xs text-gray-600">Real-time data via CoinGecko API</p>
      </section>

      {/* Investment Plans */}
      <section id="plans" className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Choose Your Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Rio Starter', range: '$100 – $999', roi: '6% – 9%', lock: '30 Days' },
              { name: 'Rio Basic', range: '$1,000 – $4,999', roi: '9% – 12%', lock: '30 Days' },
              { name: 'Rio Standard', range: '$5,000 – $14,999', roi: '12% – 16%', lock: '45 Days' },
              { name: 'Rio Advanced', range: '$15,000 – $49,999', roi: '16% – 20%', lock: '60 Days' },
              { name: 'Rio Elite', range: '$50,000+', roi: '20% – 25%', lock: '90 Days' },
            ].map((plan) => (
              <div key={plan.name} className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-indigo-500 transition-all group">
                <h3 className="text-xl font-bold text-indigo-400 mb-2">{plan.name}</h3>
                <div className="text-2xl font-bold mb-1">{plan.range}</div>
                <div className="text-green-400 font-semibold mb-6">{plan.roi} Monthly</div>
                <ul className="text-sm text-gray-400 space-y-3 mb-8">
                  <li className="flex items-center gap-2">✓ Daily Accruals</li>
                  <li className="flex items-center gap-2">✓ {plan.lock} Capital Lock</li>
                  <li className="flex items-center gap-2">✓ Instant Withdrawals</li>
                </ul>
                <Link
                  to="/register"
                  className="block w-full py-3 text-center bg-gray-800 group-hover:bg-indigo-600 rounded-xl font-bold transition-colors"
                >
                  Select Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Investors Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: 'Fast withdrawals and clear profit tracking.', author: 'James K., USA' },
              { text: 'Reliable platform with professional support.', author: 'Liam O., UK' },
              { text: 'Consistent performance and secure system.', author: 'Daniel M., Germany' },
              { text: 'Very transparent investment process.', author: 'Marco R., Italy' },
              { text: 'Excellent experience for long-term investing.', author: 'Kenji T., Japan' },
            ].map((review, i) => (
              <div key={i} className="bg-gray-800 p-8 rounded-2xl">
                <div className="text-yellow-400 mb-3">★★★★★</div>
                <p className="mb-4">"{review.text}"</p>
                <p className="text-right text-indigo-400 font-bold">– {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold text-indigo-400 mb-4">TrustraCapital</div>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto mb-8">
            Risk Warning: Trading and investing in cryptocurrencies involve significant risk. TrustraCapital is not responsible for market-related losses. Always invest responsibly.
          </p>
          <div className="text-gray-600 text-xs">
            © 2016–2026 TrustraCapitalTrade. All Rights Reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
