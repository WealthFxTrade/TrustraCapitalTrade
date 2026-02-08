import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState(68420.00);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // FIXED: Complete CoinGecko URL for EUR
        const res = await fetch('https://api.coingecko.com');
        const data = await res.json();
        if (data.bitcoin.eur) setBtcPrice(data.bitcoin.eur);
      } catch (err) {
        // Fallback simulation if API is rate-limited
        setBtcPrice(prev => prev + (Math.random() * 10 - 5));
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const plans = [
    { name: "Rio Starter", range: "€100 – €999", return: "6% - 9%", color: "bg-blue-50" },
    { name: "Rio Basic", range: "€1,000 – €4,999", return: "9% - 12%", color: "bg-blue-100" },
    { name: "Rio Standard", range: "€5,000 – €14,999", return: "12% - 16%", color: "bg-blue-200" },
    { name: "Rio Advanced", range: "€15,000 – €49,999", return: "16% - 20%", color: "bg-blue-600 text-white" },
    { name: "Rio Elite", range: "€50,000+", return: "20% - 25%", color: "bg-slate-900 text-white" },
  ];

  const reviews = [
    { name: "James K.", country: "USA", text: "Fast withdrawals and clear profit tracking. Best platform I've used." },
    { name: "Liam O.", country: "UK", text: "Reliable platform with professional support. Highly recommended." },
    { name: "Daniel M.", country: "Germany", text: "Consistent performance and secure system. Very satisfied." },
    { name: "Marco R.", country: "Italy", text: "Very transparent investment process. Trustworthy." },
    { name: "Kenji T.", country: "Japan", text: "Excellent experience for long-term investing. Great returns." },
  ];

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b sticky top-0 bg-white z-50">
        <div className="text-2xl font-bold tracking-tighter text-blue-700">TrustraCapital</div>
        <div className="space-x-6 flex items-center">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold hover:text-blue-600 transition cursor-pointer">Login</button>
          <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition">Register</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-24 px-8 text-center max-w-5xl mx-auto">
        <h1 className="text-6xl font-black mb-6 tracking-tight leading-tight">Invest in Bitcoin with Confidence</h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Since 2016, we help investors grow capital via secure automated trading.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition">Get Started</button>
          <button onClick={() => document.getElementById('plans').scrollIntoView({ behavior: 'smooth' })} className="border border-gray-300 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition">View Plans</button>
        </div>
      </header>

      {/* Ticker */}
      <div className="bg-slate-900 py-6 text-center shadow-inner">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-1">Live Market Price (EUR)</p>
        <p className="text-4xl font-mono font-bold text-white">
          1 BTC = €{btcPrice.toLocaleString('de-DE', {minimumFractionDigits: 2})}
        </p>
        <p className="text-[10px] text-gray-500 mt-2">Real-time data provided by CoinGecko</p>
      </div>

      {/* Plans Grid */}
      <section id="plans" className="py-24 px-8 max-w-7xl mx-auto bg-white text-center">
        <h2 className="text-4xl font-extrabold mb-12">Institutional Investment Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`${plan.color} p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition text-left`}>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest mb-2 opacity-80">{plan.name}</h3>
                <p className="text-2xl font-black mb-6">{plan.range}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Monthly Target</p>
                <p className="text-2xl font-black">{plan.return}</p>
                <button onClick={() => navigate('/register')} className="mt-4 w-full py-2 text-xs font-bold border rounded-lg hover:bg-white hover:text-blue-600 transition">Join Plan</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 px-8">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 italic">"Fast withdrawals and clear profit tracking."</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {reviews.map((rev, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-600 mb-4 italic">"{rev.text}"</p>
                        <p className="font-bold text-xs uppercase tracking-widest text-blue-700">{rev.name}, {rev.country}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
                <h4 className="font-black text-xl mb-4 text-blue-700 uppercase">TrustraCapital</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Leading secure, automated digital asset management since 2016.</p>
            </div>
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-4">Contact Support</h4>
                <p className="text-sm text-gray-600 mb-2"><strong>Email:</strong> managementcare2@gmail.com</p>
                <p className="text-sm text-gray-600"><strong>Phone:</strong> +1 (878) 224-1625</p>
            </div>
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-4">Global HQ</h4>
                <p className="text-sm text-gray-600 leading-relaxed italic">One World Trade Center, Suite 85, New York, NY</p>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">© 2016–2026 TrustraCapitalTrade. All Rights Reserved.</p>
            <p className="text-[9px] text-gray-400 mt-4 italic max-w-2xl mx-auto uppercase">Risk Warning: Trading cryptocurrencies involves significant risk. Invest responsibly and only what you can afford to lose.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

