import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, ArrowRight, MessageCircle, 
  Mail, MapPin, Globe, Cpu, TrendingUp, Lock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoiCalculator from './RoiCalculator';

// ── INSTITUTIONAL ASSET CLASSES ──
const ASSET_CLASSES = [
  { id: 'class1', name: 'Class I: Entry', yieldRange: '6–9%', min: 100, desc: 'Diversified Liquidity Access for emerging portfolios.' },
  { id: 'class2', name: 'Class II: Core', yieldRange: '9–12%', min: 1000, desc: 'Enhanced execution with smart order routing logic.' },
  { id: 'class3', name: 'Class III: Prime', yieldRange: '12–16%', min: 5000, desc: 'Priority execution & automated portfolio rebalancing.' },
  { id: 'class4', name: 'Class IV: Institutional', yieldRange: '16–20%', min: 15000, desc: 'Dedicated asset validation & private governance.' },
  { id: 'class5', name: 'Class V: Sovereign', yieldRange: '20–25%', min: 50000, desc: 'HFT Arbitrage access & institutional dark pool liquidity.' },
];

// ── GLOBAL CONSENSUS (REVIEWS) ──
const PERFORMANCE_REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", initial: "M", text: "The London execution protocol is exceptional. Our Class V allocation has maintained consistent alpha through multiple cycles." },
  { name: "Sven Lindholm", country: "Sweden", initial: "S", text: "Grade-A precision. Automated liquidity management provided critical downside protection during the Q1 market correction." },
  { name: "Elena Rossi", country: "Italy", initial: "E", text: "Finally, a terminal that respects European regulatory standards. High-speed execution and seamless daily settlements." },
];

// ── MARKET ORACLE COMPONENT ──
const MarketOracle = () => {
  const [marketData, setMarketData] = useState({ rawPrice: 0, change: 0, low: 0, high: 0, currency: 'EUR', loading: true });
  const isMounted = useRef(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin&price_change_percentage=24h');
      const data = await res.json();
      if (data?.[0] && isMounted.current) {
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
      if (isMounted.current) setMarketData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => { isMounted.current = false; clearInterval(interval); };
  }, [fetchPrice]);

  const toggleCurrency = () => setMarketData(prev => ({ ...prev, currency: prev.currency === 'EUR' ? 'USD' : 'EUR' }));

  const formattedPrice = useMemo(() => {
    const rate = marketData.currency === 'USD' ? 1.09 : 1;
    const val = marketData.rawPrice * rate;
    return val.toLocaleString(marketData.currency === 'EUR' ? 'de-DE' : 'en-US', { 
      style: 'currency', currency: marketData.currency, minimumFractionDigits: 0 
    });
  }, [marketData.rawPrice, marketData.currency]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2">Real-Time Oracle / {marketData.currency}</h4>
          <p className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] italic">Institutional Liquidity Stream v3.4</p>
        </div>
        <div className="text-left md:text-right">
          <button onClick={toggleCurrency} className="text-4xl font-black italic text-white tracking-tighter hover:text-emerald-500 transition-all outline-none">
            {marketData.loading ? 'SYNCING...' : formattedPrice}
          </button>
          <div className={`text-[11px] font-black mt-2 ${marketData.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}% <span className="opacity-40">/ 24H VOLATILITY</span>
          </div>
        </div>
      </div>

      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Intraday Low', val: marketData.low },
          { label: 'Intraday High', val: marketData.high },
          { label: 'Execution', val: 'Active', color: 'text-emerald-500' },
          { label: 'Latency', val: '0.4ms', color: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <span className="block text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">{stat.label}</span>
            <span className={`text-xs font-bold uppercase italic ${stat.color || 'text-white'}`}>
              {typeof stat.val === 'number' ? stat.val.toLocaleString() : stat.val}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ── MAIN LANDING PAGE ──
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialized, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (isAuthenticated) navigate('/dashboard', { replace: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, navigate]);

  const handleSupportClick = () => window.open('https://wa.me/18782241625?text=Protocol%20Inquiry', '_blank');

  if (!initialized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden font-sans antialiased">
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" />

      {/* HEADER */}
      <nav className={`fixed top-0 w-full z-[90] transition-all duration-500 ${scrolled ? 'bg-[#020408]/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-black fill-current" size={20} />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Trustra<span className="text-emerald-500">Capital</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#assets" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white">Assets</a>
            <a href="#oracle" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white">Oracle</a>
            <Link to="/login" className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Client Terminal</Link>
            <button onClick={() => navigate('/register')} className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-emerald-500 transition-all">Initialize Account</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-10">
            <Activity size={12} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">2026 Sovereign Protocol Active</span>
          </motion.div>
          
          <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter text-white leading-[0.8] mb-12">
            Strategic <br /><span className="text-emerald-500">Alpha</span> Engine
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium leading-relaxed mb-16 italic">
            Access institutional-grade capital management via proprietary quantitative strategies capturing high-yield market inefficiencies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto border-y border-white/5 py-12 mb-16">
            <div><p className="text-4xl font-black text-white italic">€2.4B+</p><p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mt-2">Assets Under Mgmt</p></div>
            <div><p className="text-4xl font-black text-white italic">99.99%</p><p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mt-2">Uptime Protocol</p></div>
            <div><p className="text-4xl font-black text-white italic">412</p><p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mt-2">Active Portfolios</p></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="px-12 py-6 bg-emerald-500 text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl flex items-center gap-4 hover:scale-105 transition-all">Get Started <ArrowRight size={18}/></button>
            <button onClick={handleSupportClick} className="px-12 py-6 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all">Consultation</button>
          </div>
        </div>
      </section>

      {/* ASSET CLASSES */}
      <section id="assets" className="py-32 px-6 bg-[#05070a] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Capital <span className="text-emerald-500">Allocation</span> Tiers</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Select your institutional growth protocol</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {ASSET_CLASSES.map((asset) => (
              <motion.div key={asset.id} whileHover={{ y: -8 }} className="p-8 bg-[#020408] border border-white/5 rounded-[2rem] hover:border-emerald-500/30 transition-all cursor-pointer group" onClick={() => navigate(`/register?tier=${asset.id}`)}>
                <h4 className="text-[11px] font-black uppercase text-white mb-4 group-hover:text-emerald-500 transition-colors">{asset.name}</h4>
                <div className="text-3xl font-black text-emerald-500 mb-6 italic">{asset.yieldRange}</div>
                <p className="text-slate-500 text-xs leading-relaxed mb-8 h-12 overflow-hidden">{asset.desc}</p>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic border-t border-white/5 pt-4">Min: €{asset.min.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET ORACLE */}
      <section id="oracle" className="py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Live <span className="text-emerald-500">Oracle</span> Feed</h3>
        </div>
        <MarketOracle />
      </section>

      {/* ROI CALCULATOR */}
      <section className="py-32 px-6 bg-[#05070a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Growth <span className="text-emerald-500">Projection</span></h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Simulate your portfolio performance</p>
          </div>
          <RoiCalculator />
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-20 text-center">Institutional <span className="text-emerald-500">Consensus</span></h3>
          <div className="grid md:grid-cols-3 gap-8">
            {PERFORMANCE_REVIEWS.map((review, i) => (
              <div key={i} className="p-10 bg-white/5 rounded-[2.5rem] border-l-4 border-emerald-500 relative">
                <div className="absolute top-8 right-8 text-emerald-500 opacity-20"><ShieldCheck size={40} /></div>
                <p className="text-slate-300 italic mb-8 font-medium leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-black text-black">{review.initial}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">{review.name}</p>
                    <p className="text-[9px] font-black uppercase text-slate-500">{review.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CHANNELS */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6 cursor-pointer hover:bg-emerald-500/10 transition-all" onClick={handleSupportClick}>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500"><MessageCircle size={28} /></div>
            <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">WhatsApp</p><p className="font-bold text-white italic">+1 (878) 224-1625</p></div>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6 cursor-pointer hover:bg-emerald-500/10 transition-all" onClick={() => window.location.href = 'mailto:infocare@gmail.com'}>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500"><Mail size={28} /></div>
            <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p><p className="font-bold text-white italic">INFOCARE@GMAIL.COM</p></div>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500"><MapPin size={28} /></div>
            <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">London HQ</p><p className="font-bold text-white italic text-xs uppercase">128 City Road, EC1V 2NX</p></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 bg-[#05070a] border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-slate-600">
          <div className="flex items-center gap-3">
            <Zap className="text-emerald-500" size={24} />
            <span className="font-black italic uppercase text-lg text-white">Trustra<span className="text-emerald-500">Capital</span></span>
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.4em] italic">Established 2016 / Institutional Alpha Protocol</div>
          <p className="text-[9px] font-bold tracking-widest uppercase">© 2026 Trustra Capital. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
