import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, ArrowRight, Lock, 
  CheckCircle2, TrendingUp, Menu, X, Mail, MessageCircle, MapPin, Globe, Star 
} from 'lucide-react';
import API from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import RoiCalculator from './RoiCalculator';

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

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        const data = await res.json();
        setBtcPrice(data.bitcoin.eur);
      } catch (err) { console.error(err); }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlanClick = async (id) => {
    if (!isAuthenticated) return navigate(`/register?plan=${id}`);
    try {
      setLoadingPlan(id);
      await API.post('/investments/create', { plan: id });
      navigate('/dashboard');
    } catch (err) { navigate('/dashboard'); } 
    finally { setLoadingPlan(null); }
  };

  if (!initialized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden font-sans antialiased">
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" />

      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-[90] transition-all duration-500 ${
        scrolled ? 'bg-[#020408]/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6 md:py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-black fill-current" size={18} />
            </div>
            <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter text-white">
              Trustra<span className="text-emerald-500">Capital</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {btcPrice && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <span className="text-[8px] font-black text-emerald-500 tracking-tighter uppercase">BTC/EUR</span>
                <span className="text-[10px] font-mono text-white">€{btcPrice.toLocaleString()}</span>
              </div>
            )}
            <a href="#plans" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white">Yield Tiers</a>
            <a href="#branches" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white">Global</a>
            <Link to="/login" className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Client Terminal</Link>
            <button onClick={() => navigate('/register')} className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-emerald-500 transition-all">
              Create Account
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-full bg-[#0a0c10] border-b border-white/5 lg:hidden overflow-hidden">
              <div className="p-6 flex flex-col gap-5 text-center">
                <a href="#plans" onClick={() => setMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-400">Yield Tiers</a>
                <a href="#branches" onClick={() => setMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-400">Global Offices</a>
                <Link to="/login" className="text-xs font-black uppercase tracking-widest text-white">Client Login</Link>
                <button onClick={() => navigate('/register')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs">Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 md:pt-60 pb-20 md:pb-32 px-6 text-center">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-8">
            <Activity size={10} className="text-emerald-500" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">SECURED V3 ALPHA PROTOCOL</span>
          </motion.div>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-white leading-[1.1] md:leading-[0.9] mb-8 uppercase italic">
            Digital Asset <br className="hidden sm:block" /><span className="text-emerald-500">Management</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-base text-slate-400 mb-10 italic leading-relaxed px-4">
            Institutional-grade capital allocation via proprietary quantitative strategies and sub-millisecond execution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:scale-105 transition-all">
              Start Investing <ArrowRight size={16}/>
            </button>
            <button onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_SUPPORT_NUMBER}`, '_blank')} className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all">
              Consult Support
            </button>
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section id="branches" className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center md:text-left mb-12">
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2">Global <span className="text-emerald-500">Presence</span></h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">International Operating Centers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {BRANCHES.map((branch, idx) => (
              <div key={idx} className="p-6 md:p-8 bg-[#0a0c10] border border-white/5 rounded-2xl md:rounded-3xl hover:border-emerald-500/40 transition-all">
                <MapPin size={20} className="text-emerald-500 mb-4" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{branch.type}</span>
                <h4 className="text-lg font-black text-white mt-1 mb-2 italic">{branch.city}</h4>
                {branch.address && <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-tighter">{branch.address}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <RoiCalculator />

      {/* CAPITAL TIERS */}
      <section id="plans" className="py-20 md:py-32 px-6 bg-[#05070a]/40">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-16">Capital <span className="text-emerald-500">Tiers</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {PLANS.map((plan) => (
              <motion.div key={plan.id} whileHover={{ y: -5 }} className="p-6 md:p-8 bg-[#0a0c10] border border-white/5 rounded-3xl hover:border-emerald-500/40 transition-all cursor-pointer relative overflow-hidden" onClick={() => handlePlanClick(plan.id)}>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">{plan.name}</h4>
                <div className="text-3xl font-black text-emerald-500 mb-2 italic">{plan.roi}</div>
                <p className="text-[11px] text-slate-500 mb-6 italic leading-relaxed">{plan.desc}</p>
                <div className="text-[10px] font-black text-white uppercase tracking-widest pt-4 border-t border-white/5">Min: €{plan.min.toLocaleString()}</div>
                {loadingPlan === plan.id && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Activity className="text-emerald-500 animate-spin" /></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-16">What Our <span className="text-emerald-500">Clients Say</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="p-6 bg-[#0a0c10] border border-white/5 rounded-2xl hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-emerald-500" />)}
                </div>
                <p className="text-[11px] text-slate-400 mb-4 italic">"{review.text}"</p>
                <h4 className="text-[10px] font-black uppercase text-white">{review.name}</h4>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">{review.country}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 md:py-24 px-6 text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Zap className="text-emerald-500" size={24} />
            <span className="font-black italic uppercase text-lg text-white">Trustra<span className="text-emerald-500">Capital</span></span>
          </div>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-600 tracking-widest uppercase max-w-lg leading-loose px-4">
            &copy; {new Date().getFullYear()} TRUSTRA CAPITAL GLOBAL. <br />
            HQ: 600 WEST BROADWAY, SAN DIEGO, CA. SECURED END-TO-END.
          </p>
        </div>
      </footer>

      {/* MOBILE CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:hidden z-[100] bg-gradient-to-t from-[#020408] to-transparent">
        <button onClick={() => navigate('/register')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-500/20">
          Open Account Now
        </button>
      </div>

      {/* DESKTOP SUPPORT */}
      <div className="fixed bottom-8 right-8 hidden md:flex flex-col gap-4 z-[100]">
        <button onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_SUPPORT_NUMBER}`, '_blank')} className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all text-black">
           <MessageCircle size={24} />
        </button>
        <button onClick={() => window.location.href = `mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`} className="w-14 h-14 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all text-white">
           <Mail size={24} />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
