// src/components/landing/Landing.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, ArrowRight, Menu, X, MapPin, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PLANS = [
  { id: 'class1', name: 'Class I: Entry', roi: 7, min: 100, desc: 'Diversified Liquidity Access' },
  { id: 'class2', name: 'Class II: Core', roi: 10, min: 1000, desc: 'Smart Order Routing Logic' },
  { id: 'class3', name: 'Class III: Prime', roi: 14, min: 5000, desc: 'Priority Execution System' },
  { id: 'class4', name: 'Class IV: Institutional', roi: 18, min: 15000, desc: 'Advanced Asset Validation' },
  { id: 'class5', name: 'Class V: Sovereign', roi: 22, min: 50000, desc: 'HFT + Institutional Liquidity' },
];

const REVIEWS = [
  { name: "James Miller", country: "USA", text: "Fast execution and clean interface." },
  { name: "Sophie Dubois", country: "France", text: "Reliable analytics and dashboard." },
  { name: "Liam Smith", country: "UK", text: "Great UI and smooth experience." },
  { name: "Hiro Tanaka", country: "Japan", text: "Very stable platform." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();

  const [btcPrice, setBtcPrice] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // ROI Calculator state
  const [amount, setAmount] = useState(1000);
  const [plan, setPlan] = useState(PLANS[0]);
  const [result, setResult] = useState(null);

  // LIVE BTC PRICE
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
        );
        const data = await res.json();
        setBtcPrice(data?.bitcoin?.eur || 0);
      } catch (e) {
        console.error('BTC fetch error');
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // ROI CALCULATOR (REAL FUNCTIONAL LOGIC)
  const calculateROI = () => {
    const monthly = (amount * plan.roi) / 100;
    const yearly = monthly * 12;

    setResult({
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
    });
  };

  const handleInvest = (id) => {
    if (isAuthenticated) navigate('/dashboard');
    else navigate(`/register?plan=${id}`);
  };

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-emerald-400">
        Loading platform...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-black/70 backdrop-blur border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">

          <div className="flex items-center gap-2">
            <Zap className="text-emerald-400" />
            <h1 className="font-bold text-xl">TrustraCapital</h1>
          </div>

          <div className="hidden md:flex gap-6 items-center text-sm">
            <span className="text-emerald-400">BTC €{btcPrice.toLocaleString()}</span>
            <a href="#plans">Plans</a>
            <a href="#calculator">Calculator</a>
            <button onClick={() => navigate('/register')} className="bg-emerald-500 text-black px-4 py-2 rounded-lg">
              Start
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden p-4 flex flex-col gap-3 bg-black border-t border-white/10">
            <a href="#plans">Plans</a>
            <a href="#calculator">Calculator</a>
            <button onClick={() => navigate('/register')} className="bg-emerald-500 text-black py-2 rounded">
              Start Investing
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-28 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold">
          Digital Asset <span className="text-emerald-400">Management</span>
        </h1>
        <p className="text-gray-400 mt-4">
          Institutional crypto investment platform with real-time analytics.
        </p>

        <div className="mt-6 flex gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="bg-emerald-500 text-black px-6 py-3 rounded-lg">
            Start Investing
          </button>
          <button onClick={() => navigate('/dashboard')} className="border px-6 py-3 rounded-lg">
            Access Dashboard
          </button>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="calculator" className="mt-20 max-w-3xl mx-auto p-6 bg-black/40 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold mb-4">ROI Calculator</h2>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-3 bg-black border border-white/10 rounded mb-4"
          placeholder="Investment Amount (€)"
        />

        <select
          onChange={(e) => setPlan(PLANS[e.target.value])}
          className="w-full p-3 bg-black border border-white/10 rounded mb-4"
        >
          {PLANS.map((p, i) => (
            <option key={p.id} value={i}>
              {p.name} ({p.roi}%)
            </option>
          ))}
        </select>

        <button onClick={calculateROI} className="bg-emerald-500 text-black px-4 py-2 rounded w-full">
          Calculate
        </button>

        {result && (
          <div className="mt-4 text-sm text-gray-300">
            <p>Monthly Profit: €{result.monthly}</p>
            <p>Yearly Profit: €{result.yearly}</p>
          </div>
        )}
      </section>

      {/* PLANS */}
      <section id="plans" className="mt-20 max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        {PLANS.map((p) => (
          <div key={p.id} className="bg-black/40 border border-white/10 p-6 rounded-xl">
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-emerald-400 text-lg">{p.roi}% ROI</p>
            <p className="text-gray-400">{p.desc}</p>
            <p className="text-sm mt-2">Min: €{p.min}</p>

            <button
              onClick={() => handleInvest(p.id)}
              className="mt-4 w-full bg-emerald-500 text-black py-2 rounded"
            >
              Invest
            </button>
          </div>
        ))}
      </section>

      {/* REVIEWS */}
      <section className="mt-20 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Reviews</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {REVIEWS.map((r, i) => (
            <div key={i} className="p-4 bg-black/40 border border-white/10 rounded">
              <p className="text-sm">"{r.text}"</p>
              <p className="text-emerald-400 mt-2">{r.name} - {r.country}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 text-center text-gray-500 text-sm p-6 border-t border-white/10">
        © {new Date().getFullYear()} TrustraCapital
      </footer>
    </div>
  );
}
