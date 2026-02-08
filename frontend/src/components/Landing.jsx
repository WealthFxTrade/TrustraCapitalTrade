import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState(68420.00);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Updated to fetch EUR from CoinGecko
        const res = await fetch('https://api.coingecko.com');
        const data = await res.json();
        if (data.bitcoin.eur) setBtcPrice(data.bitcoin.eur);
      } catch (err) {
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

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      <nav className="flex justify-between items-center px-8 py-6 border-b sticky top-0 bg-white z-50">
        <div className="text-2xl font-bold tracking-tighter text-blue-700">TrustraCapital</div>
        <div className="space-x-6 flex items-center">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold hover:text-blue-600 transition cursor-pointer">Login</button>
          <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition">Register</button>
        </div>
      </nav>

      <header className="py-24 px-8 text-center max-w-5xl mx-auto">
        <h1 className="text-6xl font-black mb-6 tracking-tight">Invest in Bitcoin with Confidence</h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Since 2016, we help investors grow capital via secure automated trading.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition">Get Started</button>
          <button onClick={() => document.getElementById('plans').scrollIntoView({ behavior: 'smooth' })} className="border border-gray-300 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition">View Plans</button>
        </div>
      </header>

      <div className="bg-slate-900 py-6 text-center shadow-inner">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-1">Live Market Price (EUR)</p>
        <p className="text-4xl font-mono font-bold text-white">
          1 BTC = €{btcPrice.toLocaleString('de-DE', {minimumFractionDigits: 2})}
        </p>
        <p className="text-[10px] text-gray-500 mt-2">Real-time data provided by CoinGecko</p>
      </div>

      <section id="plans" className="py-24 px-8 max-w-7xl mx-auto bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`${plan.color} p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition`}>
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
    </div>
  );
};

export default Landing;

