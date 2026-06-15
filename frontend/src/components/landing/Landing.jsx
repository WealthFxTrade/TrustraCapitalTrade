// src/components/landing/Landing.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { calculateSimpleROI } from '@/utils/investmentCalculator';

const PLANS = [
  { id: 'class1', name: 'Tier I: Entry', roi: 7, min: 100, desc: 'Diversified Liquidity Access' },
  { id: 'class2', name: 'Tier II: Core', roi: 10, min: 1000, desc: 'Smart Order Routing Logic' },
  { id: 'class3', name: 'Tier III: Prime', roi: 14, min: 5000, desc: 'Priority Execution System' },
  { id: 'class4', name: 'Tier IV: Institutional', roi: 18, min: 15000, desc: 'Advanced Asset Validation' },
  { id: 'class5', name: 'Tier V: Sovereign', roi: 22, min: 50000, desc: 'HFT + Institutional Liquidity' },
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

  const [btcPrice, setBtcPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [amount, setAmount] = useState(10000);
  const [selectedPlanId, setSelectedPlanId] = useState('class3');
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const selectedPlan = useMemo(
    () => PLANS.find(p => p.id === selectedPlanId),
    [selectedPlanId]
  );

  // -----------------------------
  // BTC PRICE (production-safe)
  // -----------------------------
  useEffect(() => {
    let alive = true;

    const fetchPrice = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur',
          { signal: controller.signal }
        );

        clearTimeout(timeout);

        const data = await res.json();
        const price = data?.bitcoin?.eur;

        if (alive && price) {
          setBtcPrice(price);
        }
      } catch (err) {
        console.error('BTC fetch failed:', err);
      } finally {
        if (alive) setLoadingPrice(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  // -----------------------------
  // LIVE ROI PREVIEW & VALIDATION
  // -----------------------------
  useEffect(() => {
    if (!selectedPlan) return;

    // FIXED: Support empty inputs during live editing instead of throwing immediate structural errors
    if (amount === '' || amount === 0) {
      setValidationError('Enter a valid investment amount');
      setResult(null);
      return;
    }

    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount < 0) {
      setValidationError('Enter a valid investment amount');
      setResult(null);
      return;
    }

    if (numericAmount < selectedPlan.min) {
      setValidationError(`Minimum investment for ${selectedPlan.name} is €${selectedPlan.min.toLocaleString('de-DE')}`);
      setResult(null);
      return;
    }

    setValidationError(null);
    const calc = calculateSimpleROI(numericAmount, selectedPlan.roi, 1);

    setResult({
      monthly: calc.monthly.toFixed(2),
      yearly: calc.yearly.toFixed(2),
      total: calc.total.toFixed(2),
      finalAmount: calc.finalAmount.toFixed(2),
      plan: selectedPlan.name,
    });
  }, [amount, selectedPlanId, selectedPlan]);

  // -----------------------------
  // INVEST FLOW
  // -----------------------------
  const handleInvest = (planId) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    navigate('/register', {
      state: {
        selectedPlanId: plan.id,
        entryAmount: plan.min,
      }
    });
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
              BTC €{btcPrice ? btcPrice.toLocaleString('de-DE') : '--'}
              {loadingPrice && <span className="animate-pulse ml-1">↻</span>}
            </span>

            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-400 transition-colors"
            >
              Get Started
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 p-6 flex flex-col gap-4">
            <a href="#plans" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Investment Plans</a>
            <a href="#calculator" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">ROI Calculator</a>
            <button
              onClick={() => { setMenuOpen(false); navigate('/register'); }}
              className="bg-emerald-500 text-black py-3 rounded-xl font-semibold mt-2 w-full"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-20 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-tight"
        >
          Institutional <span className="text-emerald-400">Crypto</span><br />
          Investment Platform
        </motion.h1>

        <p className="mt-6 text-gray-400 text-xl max-w-2xl mx-auto">
          Secure. Transparent. High-yield digital asset management.
        </p>

        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate('/register')}
            className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all active:scale-95"
          >
            Open Account <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="border border-white/30 hover:bg-white/5 px-8 py-4 rounded-2xl font-semibold transition-all active:scale-95"
          >
            Access Dashboard
          </button>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="calculator" className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">ROI Calculator</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Investment Amount (€)</label>
              <input
                type="number"
                value={amount}
                min="100"
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-2xl focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Select Strategy Allocation Tier</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-lg focus:border-emerald-500 outline-none transition-colors appearance-none text-white"
              >
                {PLANS.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">
                    {p.name} — {p.roi}% Target Return
                  </option>
                ))}
              </select>
            </div>

            <AnimatePresence mode="wait">
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-2xl text-center"
                >
                  ⚠️ {validationError}
                </motion.div>
              )}

              {result && !validationError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center"
                >
                  <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Projected Returns — {result.plan}</p>
                  <p className="text-4xl font-black text-white">€{Number(result.monthly).toLocaleString('de-DE', { minimumFractionDigits: 2 })} <span className="text-base font-normal text-gray-500">/ month</span></p>
                  <p className="text-xl text-gray-300 mt-1">€{Number(result.yearly).toLocaleString('de-DE', { minimumFractionDigits: 2 })} / year</p>

                  <div className="mt-4 pt-4 border-t border-emerald-500/10">
                    <p className="text-emerald-400 font-medium">Total Yield over 12 months: <span className="font-bold text-white">€{Number(result.total).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span></p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-4xl text-center mb-12 font-bold tracking-tight">
          Investment Programs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id} className="bg-[#0a0c10] p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors">{plan.name}</h3>
                <p className="text-emerald-400 text-5xl font-black mt-4">{plan.roi}%</p>
                <p className="text-gray-500 text-sm mt-1 mb-6">Annual Target Yield Rate</p>
                <p className="text-gray-300 leading-relaxed mb-4">{plan.desc}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 border-t border-white/5 pt-4">
                  Minimum Capital: <span className="text-white font-semibold">€{plan.min.toLocaleString('de-DE')}</span>
                </p>

                <button
                  onClick={() => handleInvest(plan.id)}
                  className="w-full mt-6 bg-white text-black hover:bg-emerald-500 hover:text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Invest Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-bold text-center mb-12 tracking-tight">What Our Clients Say</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {REVIEWS.map((review, i) => (
            <div key={i} className="bg-[#0a0c10] border border-white/10 p-8 rounded-3xl">
              <p className="text-lg italic text-gray-300">“{review.text}”</p>
              <p className="mt-6 text-emerald-400 font-medium text-sm tracking-wide">
                {review.name} — {review.country}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-600 py-12 border-t border-white/5 text-sm">
        © 2026 Trustra Capital • Institutional Asset Management Engine
      </footer>

    </div>
  );
}
