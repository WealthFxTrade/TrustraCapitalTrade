import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Added useRef
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  Lock,
  Activity,
  X,
  Menu,
  ChevronRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import RoiCalculator from './RoiCalculator';

/**
 * STRATEGIC ASSET CLASSES
 */
const ASSET_CLASSES = [
  { id: 'class1', name: 'Class I: Entry', yieldRange: '6–9%', min: 100, desc: 'Diversified Liquidity Access' },
  { id: 'class2', name: 'Class II: Core', yieldRange: '9–12%', min: 1000, desc: 'Enhanced Execution & Smart Routing' },
  { id: 'class3', name: 'Class III: Prime', yieldRange: '12–16%', min: 5000, desc: 'Priority Order Execution & Rebalancing' },
  { id: 'class4', name: 'Class IV: Institutional', yieldRange: '16–20%', min: 15000, desc: 'Dedicated Asset Validation & Governance' },
  { id: 'class5', name: 'Class V: Sovereign', yieldRange: '20–25%', min: 50000, desc: 'HFT Arbitrage & Institutional Dark Pools' },
];

const PERFORMANCE_REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", initial: "M", text: "The London execution protocol is exceptional. Our Class V allocation has maintained consistent alpha through multiple market cycles since 2019." },
  { name: "Sven Lindholm", country: "Sweden", initial: "S", text: "Grade-A precision. The automated liquidity management provided critical downside protection and reduced volatility during the Q1 market correction." },
  { name: "Elena Rossi", country: "Italy", initial: "E", text: "Finally, a terminal that respects European regulatory standards. High-speed execution and seamless daily settlements for our firm." },
  { name: "Jameson Vance", country: "USA", initial: "J", text: "Operating from the New York hub, the latency is practically zero. TrustraCapital is the 2026 benchmark for risk-adjusted yield." },
  { name: "Hiroshi Tanaka", country: "Japan", initial: "H", text: "The quantum strategies are legitimate. I've transitioned my entire institutional portfolio to their liquidity engine for optimized NAV growth." },
];

const MarketOracle = () => {
  const [marketData, setMarketData] = useState({
    rawPrice: 0,
    change: 0,
    low: 0,
    high: 0,
    currency: 'EUR',
    loading: true
  });
  
  const isMounted = useRef(true); // Prevent state updates on unmounted component

  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin&price_change_percentage=24h'
      );
      const data = await response.json();
      if (data && data[0] && isMounted.current) {
        const btc = data[0];
        setMarketData(prev => ({
          ...prev,
          rawPrice: btc.current_price,
          change: btc.price_change_percentage_24h,
          low: btc.low_24h,
          high: btc.high_24h,
          loading: false,
        }));
      }
    } catch (err) {
      console.error("Oracle Sync Failure:", err);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchPrice]);

  const toggleCurrency = () => {
    setMarketData(prev => ({
      ...prev,
      currency: prev.currency === 'EUR' ? 'USD' : 'EUR'
    }));
  };

  const formattedPrice = useMemo(() => {
    const rate = marketData.currency === 'USD' ? 1.09 : 1;
    const val = marketData.rawPrice * rate;
    return val.toLocaleString(marketData.currency === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: marketData.currency,
      minimumFractionDigits: 0
    });
  }, [marketData.rawPrice, marketData.currency]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">XBT/{marketData.currency} VALUATION</h4>
          <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter">Institutional Liquidity Stream</p>
        </div>
        <div className="text-right">
          <button onClick={toggleCurrency} className="text-2xl md:text-3xl font-black italic text-white tracking-tighter hover:text-emerald-500 transition-colors">
            {marketData.loading ? 'SYNCHRONIZING...' : formattedPrice}
          </button>
          <div className={`text-[10px] font-black mt-1 ${marketData.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}% <span className="opacity-40">/ 24H VARIANCE</span>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <span className="block text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Intraday Support</span>
          <span className="text-xs font-bold">{marketData.low.toLocaleString()}</span>
        </div>
        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <span className="block text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Intraday Resistance</span>
          <span className="text-xs font-bold">{marketData.high.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>EXECUTION ENGINE: ACTIVE</span>
        </div>
        <button onClick={toggleCurrency} className="text-emerald-500 hover:text-white transition-colors uppercase">
          Toggle {marketData.currency === 'EUR' ? 'USD' : 'EUR'} Valuation
        </button>
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSupportClick = () => {
    const phone = "18782241625";
    const message = encodeURIComponent("TRUSTRA CAPITAL | Request: Institutional Advisor Consultation");
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // ── IMPORTANT: RENDER NULL INSTEAD OF SPINNER ON LANDING ──
  // This prevents the "flash" of a loader that can confuse users on 
  // public entry points.
  if (!initialized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-emerald-500 selection:text-black font-sans antialiased overflow-x-hidden">

      {/* NAVIGATION */}
      <nav className="sticky top-0 w-full z-[100] px-6 py-4 bg-[#020408]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
              <TrendingUp className="text-black w-5 h-5" />
            </div>
            <span className="font-black italic tracking-tighter text-2xl uppercase">
              TRUSTRA<span className="text-emerald-500 ml-0.5">CAPITAL</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-8">
              {['Strategies', 'Liquid Assets', 'Compliance'].map((item) => (
                <button key={item} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-emerald-400 transition-colors">
                  {item}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-white/10" />

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-black px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
              >
                <Activity size={14} /> Capital Terminal
              </button>
            ) : (
              <div className="flex gap-6 items-center">
                <button onClick={() => navigate('/login')} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Client Sign In</button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-[11px] font-black uppercase tracking-widest border border-emerald-500/50 text-emerald-400 px-6 py-2.5 rounded-full hover:bg-emerald-500 hover:text-black transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="text-emerald-500" /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-full left-0 w-full bg-[#0a0c10] border-b border-white/5 md:hidden z-50 shadow-2xl">
              <div className="p-8 flex flex-col gap-6 text-center">
                {isAuthenticated ? (
                   <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="text-[11px] font-black uppercase tracking-widest text-white py-2">Terminal</button>
                ) : (
                  <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="text-[11px] font-black uppercase tracking-widest text-white py-2">Client Sign In</button>
                )}
                <button onClick={() => { handleSupportClick(); setMobileMenuOpen(false); }} className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest rounded-xl">Institutional Support</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Strategic Asset Management Since 2016
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase">Optimized Alpha via <br/><span className="text-emerald-500">Quantitative Strategy</span></h1>
            <p className="text-gray-400 max-w-lg text-base font-medium leading-relaxed">Access institutional-grade capital management. Trustra utilizes proprietary high-frequency quantitative strategies to capture market inefficiencies across global liquidity pools and private execution venues.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/register')} className="group px-10 py-5 bg-emerald-500 text-black font-black uppercase text-[12px] tracking-widest rounded-full hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2">Open Investment Account <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>
              <button onClick={handleSupportClick} className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-[12px] tracking-widest rounded-full hover:bg-white/10 transition-all">Speak with an Advisor</button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
              {[{ label: 'AUM', val: '$2.4B+' }, { label: 'Operational Uptime', val: '99.99%' }, { label: 'Active Portfolios', val: '412' }].map(stat => (
                <div key={stat.label}>
                  <div className="text-xl font-black italic">{stat.val}</div>
                  <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <MarketOracle />
        </div>
      </section>

      {/* PORTFOLIO PROJECTION SUITE */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-1 bg-white/5" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500">Portfolio Performance Projection</h2>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <RoiCalculator tiers={ASSET_CLASSES} />
        </div>
      </section>

      {/* STRATEGIC CAPITAL ALLOCATION CLASSES */}
      <section className="py-32 bg-[#05070a] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Strategic Capital Allocation</h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Automated Asset Management Protocols</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {ASSET_CLASSES.map((asset, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-widest">{asset.name}</div>
                  <div className="text-4xl font-black text-white mb-2 italic">{asset.yieldRange}</div>
                  <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-10 leading-relaxed">{asset.desc}</div>
                </div>
                <div className="space-y-6">
                  <div className="pt-6 border-t border-white/5">
                    <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Minimum Investment</div>
                    <div className="text-xl font-black">€{asset.min.toLocaleString()}</div>
                  </div>
                  <button onClick={() => navigate('/register')} className="w-full py-4 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-2xl group-hover:bg-emerald-500 group-hover:text-black transition-all">Start Allocation</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL CONSENSUS */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Institutional Consensus</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Verified Principal Feedback</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PERFORMANCE_REVIEWS.map((rev, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-[#0a0c10] border border-white/5 p-10 rounded-[3rem] flex flex-col justify-between relative group hover:bg-[#0c0f14] transition-colors">
              <div className="absolute top-8 right-10 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"><BarChart3 size={24} /></div>
              <p className="text-gray-400 text-base leading-relaxed italic mb-10">"{rev.text}"</p>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-lg">{rev.initial}</div>
                <div>
                  <div className="text-sm font-black uppercase italic tracking-wider">{rev.name}</div>
                  <div className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">{rev.country}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05070a] border-t border-white/5 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-black w-5 h-5" />
              </div>
              <span className="font-black italic tracking-tighter text-3xl uppercase">TRUSTRA<span className="text-emerald-500">CAPITAL</span></span>
            </div>
            <p className="text-gray-500 text-[10px] leading-relaxed max-w-md uppercase font-black tracking-widest">Trustra Capital is a premier quantitative asset manager. Utilizing advanced neural networks and low-latency execution, we manage institutional capital across digital and legacy asset classes. Established 2016.</p>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Global Operational Hubs</h4>
            <div className="text-[11px] text-gray-400 space-y-4 uppercase font-black tracking-widest leading-loose">
              <div className="flex items-center gap-2 underline underline-offset-4 decoration-emerald-500/30">United States 🇺🇸</div>
              <p className="text-[9px] text-gray-600 leading-tight">One World Trade Center<br/>New York, NY 10007</p>
              <div className="flex items-center gap-2 underline underline-offset-4 decoration-emerald-500/30">United Kingdom 🇬🇧</div>
              <p className="text-[9px] text-gray-600 leading-tight">30 St Mary Axe (The Gherkin)<br/>London EC3A 8BF</p>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Inquiries & Support</h4>
            <div className="text-[11px] text-gray-400 space-y-4 uppercase font-black tracking-widest">
              <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><Phone size={14} className="text-emerald-500"/> +1 (878) 224-1625</div>
              <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><Mail size={14} className="text-emerald-500"/> infocare@gmail.com</div>
              <div className="pt-4"><div className="flex items-center gap-2 text-emerald-500 font-black"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>ADVISORY TEAM ONLINE</div></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 text-center md:text-left">
          <div className="max-w-2xl leading-relaxed">© 2026 TRUSTRA CAPITAL. All rights reserved. Managed by Trustra Group LLC. Digital asset investments carry inherent market risk. Licensed and compliant under the 2024 SEC Digital Asset Framework.</div>
          <div className="flex gap-8"><span>Legal Disclosures</span><span>SLA Agreement</span><span>Privacy Protocol</span></div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
