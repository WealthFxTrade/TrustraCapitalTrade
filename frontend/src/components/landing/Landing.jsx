// src/components/landing/Landing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Activity,
  ArrowRight,
  Menu,
  X,
  Mail,
  MessageCircle,
  MapPin,
  Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PLANS = [
  { id: 'class1', name: 'Class I: Entry', roi: '6–9%', min: 100, desc: 'Diversified Liquidity Access' },
  { id: 'class2', name: 'Class II: Core', roi: '9–12%', min: 1000, desc: 'Smart Order Routing Logic' },
  { id: 'class3', name: 'Class III: Prime', roi: '12–16%', min: 5000, desc: 'Priority Order Execution' },
  { id: 'class4', name: 'Class IV: Institutional', roi: '16–20%', min: 15000, desc: 'Dedicated Asset Validation' },
  { id: 'class5', name: 'Class V: Sovereign', roi: '20–25%', min: 50000, desc: 'HFT Arbitrage & Dark Pools' },
];

const BRANCHES = [
  { region: "North America", city: "San Diego, USA", address: "600 West Broadway, Suite 700, CA 92101", type: "HQ" },
  { region: "Europe", city: "London, UK", type: "Regional" },
  { region: "Asia", city: "Singapore", type: "Regional" },
  { region: "Middle East", city: "Dubai, UAE", type: "Operational" }
];

const REVIEWS = [
  { name: "James Miller", country: "USA", text: "Exceptional service and fast execution. Highly recommended!" },
  { name: "Sophie Dubois", country: "France", text: "Professional and reliable platform. Transparent ROI calculations." },
  { name: "Liam Smith", country: "UK", text: "Excellent support and user-friendly interface. I trust them fully." },
  { name: "Hiro Tanaka", country: "Japan", text: "Global access and quick withdrawals. Truly institutional-grade." },
  { name: "Carlos Mendez", country: "Spain", text: "High ROI and seamless experience. Very satisfied with my investments." },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);

  // Fetch BTC Price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        const data = await res.json();
        setBtcPrice(data.bitcoin?.eur);
      } catch (err) {
        console.error('Failed to fetch BTC price');
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlanClick = (id) => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate(`/register?plan=${id}`);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-emerald-500 text-xl">Initializing platform...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden font-sans antialiased">
      {/* Background Grain Effect */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" />

      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-[90] transition-all duration-500 ${
        scrolled ? 'bg-[#020408]/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6 md:py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-black" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              Trustra<span className="text-emerald-500">Capital</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {btcPrice && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                <span className="text-[9px] font-black text-emerald-500 tracking-widest">BTC/EUR</span>
                <span className="font-mono text-white">€{btcPrice.toLocaleString()}</span>
              </div>
            )}

            <a href="#plans" className="text-sm font-medium hover:text-emerald-400 transition-colors">Plans</a>
            <a href="#branches" className="text-sm font-medium hover:text-emerald-400 transition-colors">Global</a>
            <Link to="/login" className="text-sm font-medium hover:text-emerald-400 transition-colors">Client Terminal</Link>

            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"
            >
              Create Account
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-2">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full bg-[#0a0c10] border-b border-white/10"
            >
              <div className="p-8 flex flex-col gap-6 text-center">
                <a href="#plans" onClick={() => setMenuOpen(false)} className="text-lg">Investment Plans</a>
                <a href="#branches" onClick={() => setMenuOpen(false)} className="text-lg">Global Presence</a>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-lg">Client Login</Link>
                <button
                  onClick={() => { navigate('/register'); setMenuOpen(false); }}
                  className="mt-4 py-4 bg-emerald-500 text-black font-bold rounded-2xl"
                >
                  Open Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 md:pt-60 pb-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
          >
            <Activity size={14} className="text-emerald-500" />
            <span className="uppercase text-xs font-black tracking-[2px] text-emerald-500">Institutional Alpha</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white mb-6">
            Digital Asset<br />
            <span className="text-emerald-500">Management</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg text-slate-400 mb-10">
            Institutional-grade crypto investment platform with proprietary execution and risk management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              Start Investing <ArrowRight size={20} />
            </button>

            <Link
              to="/login"
              className="px-10 py-5 border border-white/30 hover:border-white rounded-2xl font-medium transition-all"
            >
              Access Terminal
            </Link>
          </div>
        </div>
      </section>

      {/* BRANCHES SECTION */}
      <section id="branches" className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-white">Global Presence</h3>
            <p className="text-slate-500 mt-2">Strategic Operating Centers Worldwide</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRANCHES.map((branch, idx) => (
              <div key={idx} className="p-8 bg-[#0a0c10] border border-white/5 rounded-3xl hover:border-emerald-500/30 transition-all">
                <MapPin size={28} className="text-emerald-500 mb-6" />
                <h4 className="text-xl font-bold text-white">{branch.city}</h4>
                <p className="text-emerald-500 text-sm mt-1">{branch.region}</p>
                {branch.address && <p className="text-xs text-slate-500 mt-4 leading-relaxed">{branch.address}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR SECTION */}
      <section className="py-20 bg-[#0a0c10] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black text-white mb-4">ROI Calculator</h2>
          <p className="text-slate-400">Interactive investment calculator coming soon...</p>
        </div>
      </section>

      {/* PLANS SECTION */}
      <section id="plans" className="py-20 md:py-32 px-6 bg-[#05070a]">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-black mb-4 text-white">Capital Tiers</h3>
          <p className="text-slate-400 mb-16">Choose your investment class</p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                onClick={() => handlePlanClick(plan.id)}
                className="p-8 bg-[#0a0c10] border border-white/5 hover:border-emerald-500 rounded-3xl cursor-pointer transition-all group"
              >
                <div className="text-emerald-500 text-sm font-bold mb-3">{plan.name}</div>
                <div className="text-5xl font-black text-white mb-3">{plan.roi}</div>
                <p className="text-slate-400 text-sm mb-8 min-h-[60px]">{plan.desc}</p>
                <div className="pt-6 border-t border-white/10 text-xs font-medium text-slate-400">
                  Minimum: €{plan.min.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-black mb-16 text-white">Client Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="p-8 bg-[#0a0c10] border border-white/5 rounded-3xl text-left">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-emerald-500" />
                  ))}
                </div>
                <p className="italic text-slate-300 mb-6">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-white">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-white/10 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Trustra Capital • Institutional Crypto Investment Platform
      </footer>
    </div>
  );
};

export default LandingPage;
