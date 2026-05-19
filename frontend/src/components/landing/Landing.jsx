// src/components/landing/Landing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
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
  const [amount, setAmount] = useState(1000);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]); // Default to Class III
  const [result, setResult] = useState(null);

  // Live BTC Price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        const data = await res.json();
        setBtcPrice(data?.bitcoin?.eur || 0);
      } catch (e) {
        console.error('Failed to fetch BTC price');
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // ROI Calculator
  const calculateROI = () => {
    const monthly = (amount * selectedPlan.roi) / 100;
    const yearly = monthly * 12;

    setResult({
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
      plan: selectedPlan.name,
    });
  };

  const handleInvest = (planId) => {
    const plan = PLANS.find(p => p.id === planId);
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // Pass plan via state (better than query params)
      navigate('/register', { 
        state: { plan: plan?.name || 'Class III: Prime' } 
      });
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-emerald-500">
        Initializing platform...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="text-emerald-400" size={28} />
            <h1 className="font-bold text-2xl tracking-tight">Trustra Capital</h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#plans" className="hover:text-emerald-400 transition-colors">Investment Plans</a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">ROI Calculator</a>
            <span className="text-emerald-400 font-medium">
              BTC €{btcPrice.toLocaleString()}
            </span>
            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-semibold transition-all"
            >
              Get Started
            </button>
          </div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden text-white"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 p-6 flex flex-col gap-4">
            <a href="#plans" className="py-2">Investment Plans</a>
            <a href="#calculator" className="py-2">ROI Calculator</a>
            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-500 text-black py-3 rounded-xl font-semibold mt-2"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tighter leading-tight"
        >
          Institutional <span className="text-emerald-400">Crypto</span><br />
          Investment Platform
        </motion.h1>

        <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
          Secure. Transparent. High-yield digital asset management.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/register')}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
          >
            Open Account <ArrowRight />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="border border-white/30 hover:bg-white/5 px-10 py-4 rounded-2xl font-semibold text-lg transition-all"
          >
            Access Dashboard
          </button>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="calculator" className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">ROI Calculator</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Investment Amount (€)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-2xl focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Plan</label>
              <select
                value={PLANS.indexOf(selectedPlan)}
                onChange={(e) => setSelectedPlan(PLANS[e.target.value])}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-lg focus:border-emerald-500 outline-none"
              >
                {PLANS.map((p, i) => (
                  <option key={p.id} value={i}>
                    {p.name} — {p.roi}% ROI
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={calculateROI}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl text-lg transition-all"
            >
              Calculate Returns
            </button>

            {result && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center"
              >
                <p className="text-emerald-400 text-sm mb-2">Projected Returns — {result.plan}</p>
                <p className="text-4xl font-bold">€{result.monthly} <span className="text-base font-normal text-gray-400">/ month</span></p>
                <p className="text-2xl mt-2">€{result.yearly} / year</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-bold text-center mb-12">Investment Programs</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className="bg-[#0a0c10] border border-white/10 hover:border-emerald-500/50 rounded-3xl p-8 transition-all group"
            >
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-5xl font-black text-emerald-400 mt-4">{plan.roi}%</p>
              <p className="text-gray-400 mt-1">Annual Target Return</p>

              <p className="mt-6 text-gray-300">{plan.desc}</p>
              <p className="mt-8 text-sm text-gray-500">Minimum Investment: <span className="text-white font-semibold">€{plan.min.toLocaleString()}</span></p>

              <button
                onClick={() => handleInvest(plan.id)}
                className="mt-10 w-full bg-white text-black hover:bg-emerald-500 hover:text-white py-4 rounded-2xl font-bold transition-all"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Invest Now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {REVIEWS.map((review, i) => (
            <div key={i} className="bg-[#0a0c10] border border-white/10 p-8 rounded-3xl">
              <p className="text-lg italic">“{review.text}”</p>
              <p className="mt-6 text-emerald-400 font-medium">
                {review.name} — {review.country}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Trustra Capital • Institutional Crypto Investment Platform
      </footer>
    </div>
  );
}
