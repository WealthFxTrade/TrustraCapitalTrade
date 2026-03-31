import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Globe, Headphones, Mail, Phone, Lock, Zap, Activity, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import RoiCalculator from './RoiCalculator';

// ── TIERS ──
const TIERS = [
  { id: 'starter', name: 'Tier I: Entry', yieldRange: '6–9%', min: 100, desc: 'Standard Liquidity' },
  { id: 'basic', name: 'Tier II: Core', yieldRange: '9–12%', min: 1000, desc: 'Enhanced Execution' },
  { id: 'standard', name: 'Tier III: Prime', yieldRange: '12–16%', min: 5000, desc: 'Priority Routing' },
  { id: 'advanced', name: 'Tier IV: Institutional', yieldRange: '16–20%', min: 15000, desc: 'Dedicated Node' },
  { id: 'elite', name: 'Tier V: Sovereign', yieldRange: '20–25%', min: 50000, desc: 'HFT Dark Pool Access' },
];

// ── CUSTOMER REVIEWS ──
const PERFORMANCE_REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", initial: "M", text: "The London plan execution is flawless. My Rio Elite plan has maintained steady alpha since 2019." },
  { name: "Sven Lindholm", country: "Sweden", initial: "S", text: "Institutional grade precision. The automated liquidity nodes saved my capital during the flash crash." },
  { name: "Elena Rossi", country: "Italy", initial: "E", text: "Finally, a terminal that respects European markets. High-speed execution and daily settlements." },
  { name: "Jameson Vance", country: "USA", initial: "J", text: "Operating from the New York hub, the latency is practically zero. TrustraCapital is the 2026 benchmark." },
  { name: "Hiroshi Tanaka", country: "Japan", initial: "H", text: "The quantum tiers are legitimate. I've transitioned my entire institutional portfolio to Rio." },
];

// ── MARKET ORACLE ──
const MarketOracle = () => {
  const [data, setData] = useState({ price: 'SYNCING...', change: '0.00', low: '0', high: '0', currency: 'EUR', loading: true });

  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin&price_change_percentage=24h'
      );
      const [btc] = await response.json();
      setData(prev => ({
        ...prev,
        price: prev.currency === 'EUR' 
          ? btc.current_price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
          : btc.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        change: btc.price_change_percentage_24h.toFixed(2),
        low: btc.low_24h.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
        high: btc.high_24h.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
        loading: false,
      }));
    } catch (err) {
      console.error("Oracle Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 45000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const toggleCurrency = () => {
    setData(prev => ({ ...prev, currency: prev.currency === 'EUR' ? 'USD' : 'EUR' }));
    fetchPrice();
  };

  return (
    <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">XBT/{data.currency} Terminal</h4>
          <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter">Live Liquidity Feed</p>
        </div>
        <div className="text-right">
          <button onClick={toggleCurrency} className="text-3xl font-black italic text-white tracking-tighter hover:text-emerald-500 transition-colors">
            {data.loading ? '...' : data.price}
          </button>
          <div className={`text-[10px] font-black ${Number(data.change) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {Number(data.change) >= 0 ? '+' : ''}{data.change}% <span className="opacity-40">/ 24H Delta</span>
          </div>
          <div className="text-[10px] mt-1 text-gray-500">
            Low: {data.low} | High: {data.high}
          </div>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 4.5 }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
      </div>
      <div className="mt-4 flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
        <span>Rio Engine Active</span>
        <button onClick={toggleCurrency} className="text-emerald-500 flex items-center gap-1 hover:underline">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Switch to {data.currency === 'EUR' ? 'USD' : 'EUR'}
        </button>
      </div>
    </div>
  );
};

// ── LANDING PAGE ──
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSupportClick = () => {
    window.open(`https://wa.me/${encodeURIComponent("TRUSTRA CAPITAL | Request: Institutional Consultation")}`, '_blank');
  };

  if (!initialized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-emerald-500 selection:text-black font-sans antialiased">

      {/* NAVIGATION */}
      <nav className="sticky top-0 w-full z-50 px-6 py-5 bg-[#020408]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <TrendingUp className="text-black w-5 h-5" />
            </div>
            <span className="font-black italic tracking-tighter text-2xl uppercase">TRUSTRA<span className="text-emerald-500">CAPITAL</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={handleSupportClick} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-400 transition-colors">Live Support</button>
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-black px-6 py-2 rounded-lg">Command Terminal</button>
            ) : (
              <div className="flex gap-6 items-center">
                <button onClick={() => navigate('/login')} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Client Login</button>
                <button onClick={() => navigate('/register')} className="text-[11px] font-black uppercase tracking-widest border border-emerald-500/50 text-emerald-400 px-6 py-2 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">Create Account</button>
              </div>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute top-full left-0 w-full bg-[#0a0c10] border-b border-white/5 overflow-hidden md:hidden">
              <div className="p-8 flex flex-col gap-6">
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Client Login</button>
                <button onClick={() => { handleSupportClick(); setMobileMenuOpen(false); }} className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest rounded-xl">Contact Support</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Market Performance Since 2016</div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase">Quantified <br/><span className="text-emerald-500">Wealth Nodes</span></h1>
            <p className="text-gray-400 max-w-md text-sm font-medium leading-relaxed">Institutional liquidity deployment across global markets. A decade of algorithmic stability and fiber-optic execution.</p>
            <button onClick={() => navigate('/register')} className="px-10 py-5 bg-emerald-500 text-black font-black uppercase text-[12px] tracking-widest rounded-full hover:scale-105 transition-transform">Explore Strategy</button>
          </div>
          <MarketOracle />
        </div>
      </section>

      {/* RIO ENGINE SIMULATOR */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <RoiCalculator tiers={TIERS} />
        </div>
      </section>

      {/* TIERS */}
      <section className="py-24 bg-[#05070a] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Strategic Capital Allocation</h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">Automated liquidity provisioning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {TIERS.map((tier, i) => (
              <div key={i} className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2rem] hover:border-emerald-500/40 transition-all group">
                <div className="text-[10px] font-black text-gray-500 uppercase mb-4">{tier.name}</div>
                <div className="text-3xl font-black text-white mb-1 italic">{tier.yieldRange}</div>
                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-6">{tier.desc}</div>
                <div className="pt-6 border-t border-white/5">
                  <div className="text-[9px] text-gray-600 uppercase font-bold">Min. Threshold</div>
                  <div className="text-lg font-black">€{tier.min.toLocaleString()}</div>
                </div>
                <button onClick={() => navigate('/register')} className="w-full mt-8 py-3 bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl group-hover:bg-emerald-500 group-hover:text-black transition-all">Provision Capital</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Performance Consensus</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {PERFORMANCE_REVIEWS.map((rev, i) => (
            <div key={i} className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between">
              <p className="text-gray-400 text-sm leading-relaxed italic mb-8">"{rev.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black font-black uppercase">{rev.initial}</div>
                <div>
                  <div className="text-sm font-black uppercase italic">{rev.name}</div>
                  <div className="text-[10px] text-gray-600 font-bold uppercase">{rev.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05070a] border-t border-white/5 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center"><TrendingUp className="text-black w-5 h-5" /></div>
              <span className="font-black italic tracking-tighter text-2xl uppercase">TRUSTRA<span className="text-emerald-500">CAPITAL</span></span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm uppercase font-bold">USA Headquartered liquidity provider specializing in HFT algorithmic asset deployment. Market presence established Oct 2016.</p>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-6">Global HQ</h4>
            <div className="text-xs text-gray-400 space-y-2 uppercase font-bold leading-loose">
              United States 🇺🇸<br/>One World Trade Center<br/>New York, NY 10007
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-6">Support Terminal</h4>
            <div className="text-xs text-gray-400 space-y-2 uppercase font-bold">
              <div className="flex items-center gap-2"><Phone size={14}/> +1 (878) 224-1625</div>
              <div className="flex items-center gap-2"><Mail size={14}/> www.infocare@gmail.com</div>
              <div className="text-emerald-500 pt-2 flex items-center gap-2 font-black"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Support Live 24/7</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <div>© 2026 TRUSTRA CAPITAL. All rights reserved. Licensed and compliant with USA financial regulations. Risk disclosure applies.</div>
          <div className="flex gap-8">
            <span>Security Audit</span>
            <span>Execution Protocol</span>
            <span>Risk Disclosure</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
