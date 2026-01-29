// src/components/Landing.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, CheckCircle } from 'lucide-react';

const reviews = [
  { name: "James K.", country: "USA", rating: 5, text: "Fast withdrawals and clear profit tracking. Best platform I've used." },
  { name: "Liam O.", country: "UK", rating: 5, text: "Reliable platform with professional support. Highly recommended." },
  { name: "Daniel M.", country: "Germany", rating: 5, text: "Consistent performance and secure system. Very satisfied." },
  { name: "Marco R.", country: "Italy", rating: 5, text: "Very transparent investment process. Trustworthy." },
  { name: "Kenji T.", country: "Japan", rating: 5, text: "Excellent experience for long-term investing. Great returns." },
];

export default function Landing() {
  const [btcPrice, setBtcPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        setBtcPrice(data.bitcoin.usd);
      } catch {}
      finally { setLoadingPrice(false); }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const plans = [
    { name: 'Rio Starter', range: '$100–$999', monthly: '6%–9%' },
    { name: 'Rio Basic', range: '$1,000–$4,999', monthly: '9%–12%' },
    { name: 'Rio Standard', range: '$5,000–$14,999', monthly: '12%–16%' },
    { name: 'Rio Advanced', range: '$15,000–$49,999', monthly: '16%–20%' },
    { name: 'Rio Elite', range: '$50,000+', monthly: '20%–25%' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="border-b border-gray-800 bg-gray-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-bold">TrustraCapital</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-4 py-2 rounded-md hover:bg-gray-800 transition">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20">
        <h1 className="text-5xl font-bold mb-6 text-indigo-400">Invest in Bitcoin with Confidence</h1>
        <p className="text-lg text-gray-300 mb-10 max-w-3xl">
          Since 2016, we help investors grow capital via secure automated trading.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-12">
          <Link to="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition">Get Started</Link>
          <a href="#plans" className="px-8 py-4 border border-indigo-500 rounded-lg hover:bg-indigo-900/30 font-bold transition">View Plans</a>
        </div>

        <div className="mb-12">
          <p className="text-xl font-semibold mb-2">Live BTC Price</p>
          {loadingPrice ? (
            <p className="animate-pulse text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-green-400">1 BTC = ${btcPrice?.toLocaleString()}</p>
          )}
        </div>

        <section id="plans" className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {plans.map(plan => (
            <div key={plan.name} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-1">{plan.range}</p>
              <p className="text-xl font-semibold text-indigo-400">{plan.monthly} Monthly</p>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mt-16 max-w-7xl mx-auto">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col">
              <div className="flex mb-4">{[...Array(review.rating)].map((_, j) => <Star key={j} className="h-5 w-5 text-yellow-400" />)}</div>
              <p className="text-gray-300 mb-4 flex-1">"{review.text}"</p>
              <div className="text-sm text-gray-400"><strong>{review.name}</strong>, {review.country}</div>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-12 text-center text-gray-400">
        <p>© 2016–2026 TrustraCapitalTrade. All Rights Reserved.</p>
        <p className="text-sm mt-2">
          Risk Warning: Trading cryptocurrencies involves risk. Invest responsibly.
        </p>
      </footer>
    </div>
  );
}
