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
import RoiCalculator from './RoiCalculator'; // Assuming this component exists

// Live Bitcoin Price in EUR (using CoinGecko public API)
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
        setPriceEur(
          btc.eur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
        );
        setChange24h(btc.eur_24h_change.toFixed(2));
      } catch (err) {
        console.error('BTC EUR fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-400 animate-pulse">Loading BTC price...</div>;
  }

  const isPositive = change24h >= 0;

  return (
    <div className="inline-flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
      <span className="text-sm text-gray-400 uppercase tracking-wider mb-1">
        Bitcoin Price (EUR)
      </span>
      <span className="text-3xl md:text-4xl font-black text-white">{priceEur || '—'}</span>
      <span
        className={`text-sm font-semibold mt-1 ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}
      >
        24h: {isPositive ? '+' : ''}
        {change24h || '—'}%
      </span>
    </div>
  );
};

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

const PLANS = [
  { id: 'starter', name: 'Rio Starter', profit: '6–9%', min: '€100', color: 'from-blue-500/20' },
  { id: 'basic', name: 'Rio Basic', profit: '9–12%', min: '€1,000', color: 'from-emerald-500/20' },
  { id: 'standard', name: 'Rio Standard', profit: '12–16%', min: '€5,000', color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', profit: '16–20%', min: '€15,000', color: 'from-orange-500/20' },
  { id: 'elite', name: 'Rio Elite', profit: '20–25%', min: '€50,000', color: 'from-yellow-500/20' },
];

const PlansGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-5 bg-[#020408]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Select Your <span className="text-yellow-500">Rio Plan</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Choose a liquidity tier to begin automated profit execution with Rio percentage returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative group overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b ${plan.color} to-transparent p-6 md:p-8 transition-all hover:border-yellow-500/50 hover:-translate-y-2`}
            >
              <div className="relative z-10">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-widest mb-2 text-white">
                  {plan.name}
                </h3>
                <div className="text-4xl md:text-5xl font-black italic mb-6 text-yellow-500">
                  {plan.profit}
                </div>
                <div className="space-y-4 mb-8 text-sm md:text-base">
                  <div className="flex justify-between text-gray-300">
                    <span>Minimum Deposit</span>
                    <span className="font-bold text-white">{plan.min}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Rio Annual Profit</span>
                    <span className="font-bold text-yellow-400">{plan.profit}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/signup', { state: { plan: plan.id } })}
                  className="w-full py-4 bg-white/10 border border-white/20 rounded-xl text-sm md:text-base font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300"
                >
                  Activate Plan
                </button>
              </div>
            </div>
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

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden relative">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 border-b ${
          scrolled ? 'bg-[#020408]/90 backdrop-blur-2xl py-4 border-white/10' : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Zap size={28} className="text-yellow-500 fill-current" />
            <span className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase">
              TRUSTRA
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <LiveBitcoinPrice />
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] md:text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-yellow-500 text-black px-6 md:px-8 py-3 md:py-4 rounded-xl text-[11px] md:text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
            >
              Create Account
            </button>
          </div>

          <button className="md:hidden p-2 text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0c10]/95 border-b border-white/10 p-6 flex flex-col gap-5 animate-in slide-in-from-top duration-300">
            <LiveBitcoinPrice />
            <button
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              className="w-full py-4 text-[13px] font-black uppercase tracking-widest text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
            >
              Login
            </button>
            <button
              onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
              className="w-full py-4 bg-yellow-500 text-black text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition-all"
            >
              Create Account
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 md:pt-64 md:pb-32 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 px-5 py-3 rounded-full text-gray-400 text-[11px] md:text-sm font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={18} className="text-yellow-500" />
            SECURED BY ADVANCED PROTOCOLS
          </div>

          <h1 className="text-5xl md:text-[90px] lg:text-[110px] font-black tracking-tight leading-[0.9] uppercase">
            Wealth <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">Redefined</span>
            <br />
            <span className="text-yellow-500 italic">Automated.</span>
          </h1>

          <p className="text-gray-400 text-base md:text-xl lg:text-2xl max-w-3xl mx-auto font-bold uppercase">
            Institutional-grade algorithmic trading. Precision execution across global hubs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <LiveBitcoinPrice />
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-yellow-500 text-black px-10 md:px-12 py-5 rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-xl"
            >
              Start Earning <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="px-4 md:px-6 mb-20 md:mb-24 max-w-6xl mx-auto">
        <RoiCalculator />
      </section>

      {/* User Reviews */}
      <section className="py-20 md:py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[11px] md:text-[13px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-12 md:mb-16 italic">
            Global Pulse
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {REVIEWS.map((rev, i) => (
              <div
                key={i}
                className="p-6 md:p-8 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] group hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={12} className="fill-yellow-500 text-yellow-500" />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <div ref={plansRef}>
        <PlansGrid />
      </div>

      {/* Footer */}
      <footer className="py-20 md:py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="space-y-6">
            <h3 className="text-lg md:text-xl font-black italic uppercase text-yellow-500">
              Network Presence
            </h3>
            <p className="text-xs md:text-sm text-gray-400 uppercase font-bold tracking-wider leading-loose">
              Our headquarters is in USA and our branches are in European and international continents.
            </p>
            <p className="text-xs md:text-sm text-gray-500 uppercase font-bold tracking-wider">
              Global access • Low-latency execution
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg md:text-xl font-black italic uppercase text-yellow-500">
              TrustraCapitalTrade Support
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
              <div className="w-2 h-2 md:w-3 md:h-3 bg-emerald-500 rounded-full animate-pulse" />
              Systems Operational
            </div>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-tighter leading-relaxed">
              Risk Disclosure: Algorithmic trading involves significant risk. 2026 performance is monitored but not guaranteed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
