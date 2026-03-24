// src/components/landing/Landing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Star,
  Menu,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoiCalculator from './RoiCalculator'; // Assuming this component exists

// ── LIVE BITCOIN PRICE COMPONENT ──
const LiveBitcoinPrice = () => {
  const [priceEur, setPriceEur] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    try {
      setError(null);
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true'
      );
      if (!res.ok) throw new Error('Failed to fetch BTC price');
      const data = await res.json();
      const btc = data.bitcoin;
      setPriceEur(btc.eur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));
      setChange24h(btc.eur_24h_change.toFixed(2));
    } catch (err) {
      console.error('BTC EUR fetch failed:', err);
      setError('Price unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-gray-500 animate-pulse">Loading BTC...</div>;
  if (error) return <div className="text-rose-400 text-sm">{error}</div>;

  const isPositive = Number(change24h) >= 0;

  return (
    <div className="inline-flex flex-col items-center bg-black/50 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-md shadow-lg">
      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        Bitcoin (EUR)
      </span>
      <span className="text-2xl md:text-3xl font-black text-white">
        {priceEur || '—'}
      </span>
      <span className={`text-xs font-semibold mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        24h: {isPositive ? '+' : ''}{change24h || '—'}%
      </span>
    </div>
  );
};

// ── REVIEWS DATA ──
const REVIEWS = [
  {
    name: "Marcus Thorne",
    country: "United Kingdom",
    text: "The London plan execution is flawless. My Rio Elite plan has maintained steady profits.",
  },
  {
    name: "Sven Lindholm",
    country: "Sweden",
    text: "Institutional grade precision. The automated plans saved my capital during the flash crash.",
  },
  {
    name: "Elena Rossi",
    country: "Italy",
    text: "Finally, a terminal that respects European markets. High-speed and daily payouts.",
  },
  {
    name: "Jameson Vance",
    country: "USA",
    text: "Operating from the New York hub, the latency is practically zero. TrustraCapitalTrade is the 2026 benchmark.",
  },
  {
    name: "Hiroshi Tanaka",
    country: "Japan",
    text: "The quantum plans are legitimate. I've switched my entire portfolio to the Rio plans.",
  },
];

// ── PLANS GRID COMPONENT ──
const PlansGrid = () => {
  const navigate = useNavigate();

  const PLANS = [
    { id: 'starter', name: 'Rio Starter', profit: '6–9%', min: '€100', color: 'from-blue-500/20' },
    { id: 'basic', name: 'Rio Basic', profit: '9–12%', min: '€1,000', color: 'from-emerald-500/20' },
    { id: 'standard', name: 'Rio Standard', profit: '12–16%', min: '€5,000', color: 'from-purple-500/20' },
    { id: 'advanced', name: 'Rio Advanced', profit: '16–20%', min: '€15,000', color: 'from-orange-500/20' },
    { id: 'elite', name: 'Rio Elite', profit: '20–25%', min: '€50,000', color: 'from-yellow-500/20' },
  ];

  return (
    <section className="py-20 md:py-32 px-5 bg-[#020408]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Select Your <span className="text-yellow-500">Rio Plan</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Choose your liquidity tier to activate automated profit execution with Rio yields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: PLANS.indexOf(plan) * 0.1 }}
              className={`relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b ${plan.color} to-transparent p-8 transition-all duration-500 hover:border-yellow-500/50 hover:-translate-y-4 hover:shadow-2xl hover:shadow-yellow-900/20 group focus-within:ring-2 focus-within:ring-yellow-500/50 focus:outline-none`}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/register', { state: { plan: plan.id } })}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/register', { state: { plan: plan.id } })}
              aria-label={`Activate ${plan.name} plan`}
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white group-hover:text-yellow-500 transition-colors">
                  {plan.name}
                </h3>

                <div className="text-5xl md:text-6xl font-black italic mb-8 text-yellow-500">
                  {plan.profit}
                </div>

                <div className="space-y-4 mb-10 text-sm md:text-base">
                  <div className="flex justify-between text-gray-300">
                    <span>Minimum Deposit</span>
                    <span className="font-bold text-white">{plan.min}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Rio Annual Yield</span>
                    <span className="font-bold text-yellow-400">{plan.profit}</span>
                  </div>
                </div>

                <button
                  className="w-full py-5 bg-white/10 border border-white/20 rounded-2xl text-sm md:text-base font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-lg"
                  aria-hidden="true" // decorative button – main action is on card
                >
                  Activate Plan
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const plansRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden relative">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 border-b ${
          scrolled ? 'bg-[#020408]/95 backdrop-blur-2xl py-4 border-white/10 shadow-lg' : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Zap size={32} className="text-yellow-500 fill-current" />
            <span className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase">
              TRUSTRA
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <LiveBitcoinPrice />

            <button
              onClick={() => navigate('/login')}
              className="text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
            >
              Login
            </button>

            <button
              onClick={() => navigate('/register')}
              className="bg-yellow-500 text-black px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
            >
              Create Account
            </button>
          </div>

          <button
            className="md:hidden p-3 text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 w-full bg-[#0a0c10]/95 border-b border-white/10 p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300 backdrop-blur-xl"
            >
              <LiveBitcoinPrice />

              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-5 text-lg font-black uppercase tracking-widest text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                Login
              </button>

              <button
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-5 bg-yellow-500 text-black text-lg font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-all"
              >
                Create Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 md:pt-64 md:pb-32 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-4 bg-white/[0.03] border border-white/10 px-6 py-4 rounded-full text-gray-400 text-sm font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={20} className="text-yellow-500" />
            SECURED BY ADVANCED PROTOCOLS
          </div>

          <h1 className="text-5xl md:text-[100px] lg:text-[120px] font-black tracking-tighter leading-[0.9] uppercase">
            Wealth <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600">Redefined</span>
            <br />
            <span className="text-yellow-500 italic">Automated.</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-2xl lg:text-3xl max-w-4xl mx-auto font-bold uppercase">
            Institutional-grade algorithmic trading. Precision execution across global hubs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <LiveBitcoinPrice />

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToPlans}
                className="w-full sm:w-auto px-10 py-5 bg-transparent border border-yellow-500/50 text-yellow-500 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-yellow-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                View Plans
              </button>

              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-12 py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                Start Earning <ArrowRight size={20} className="inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="px-4 md:px-6 mb-20 md:mb-32 max-w-6xl mx-auto">
        <RoiCalculator />
      </section>

      {/* User Reviews */}
      <section className="py-20 md:py-32 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[11px] md:text-[13px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-12 md:mb-16 italic">
            Global Pulse • Verified Users
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {REVIEWS.map((rev, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-6 md:p-8 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] group hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-[11px] md:text-sm text-gray-300 leading-relaxed italic mb-6">
                  "{rev.text}"
                </p>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[11px] md:text-sm font-black text-white uppercase">{rev.name}</p>
                  <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase italic mt-1">
                    {rev.country}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <div ref={plansRef}>
        <PlansGrid />
      </div>

      {/* Footer */}
      <footer className="py-20 md:py-32 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="space-y-6">
            <h3 className="text-lg md:text-xl font-black italic uppercase text-yellow-500">
              Network Presence
            </h3>
            <p className="text-xs md:text-sm text-gray-400 uppercase font-bold tracking-wider leading-loose">
              Headquarters in USA. Branches across European and international continents.
            </p>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-tighter">
              Global access • Ultra-low latency execution
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg md:text-xl font-black italic uppercase text-yellow-500">
              Support Channels
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:www.infocare@gmail.com"
                className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-mono hover:text-yellow-500 transition-all uppercase underline decoration-white/10"
              >
                <Mail size={16} className="text-yellow-500" /> www.infocare@gmail.com
              </a>
              <a
                href="https://wa.me/18782241625"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-mono hover:text-yellow-500 transition-all uppercase"
              >
                <Phone size={16} className="text-yellow-500" /> WhatsApp: +1 (878) 224-1625
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg md:text-xl font-black italic uppercase text-yellow-500">
              Infrastructure
            </h3>
            <div className="flex items-center gap-3 text-emerald-400 font-mono text-xs md:text-sm font-black uppercase tracking-widest">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
              Systems Operational
            </div>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-tighter leading-relaxed">
              <strong>Risk Disclosure:</strong> Algorithmic trading involves significant risk. Past performance is not indicative of future results.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] text-gray-600 uppercase tracking-widest">
          © 2026 Trustra Capital • All Rights Reserved • Zurich Vault Secured
        </div>
      </footer>
    </div>
  );
}
