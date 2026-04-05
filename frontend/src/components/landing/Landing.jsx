import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, ArrowRight, Lock, 
  CheckCircle2, TrendingUp, Menu, X 
} from 'lucide-react';
import API from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import RoiCalculator from './RoiCalculator';

// ── INSTITUTIONAL ASSET CLASSES ──
const PLANS = [
  { id: 'class1', name: 'Class I: Entry', roi: '6–9%', min: 100, desc: 'Diversified Liquidity Access' },
  { id: 'class2', name: 'Class II: Core', roi: '9–12%', min: 1000, desc: 'Smart Order Routing Logic' },
  { id: 'class3', name: 'Class III: Prime', roi: '12–16%', min: 5000, desc: 'Priority Order Execution' },
  { id: 'class4', name: 'Class IV: Institutional', roi: '16–20%', min: 15000, desc: 'Dedicated Asset Validation' },
  { id: 'class5', name: 'Class V: Sovereign', roi: '20–25%', min: 50000, desc: 'HFT Arbitrage & Dark Pools' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialized } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlanClick = async (id) => {
    if (!isAuthenticated) {
      return navigate(`/register?plan=${id}`);
    }

    try {
      setLoadingPlan(id);
      await API.post('/investments/create', { plan: id });
      navigate('/dashboard');
    } catch (err) {
      console.error("Investment initialization failed:", err);
      navigate('/dashboard');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!initialized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden font-sans antialiased">
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" />

      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 w-full z-[90] transition-all duration-500 ${
        scrolled ? 'bg-[#020408]/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-black fill-current" size={20} />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">
              Trustra<span className="text-emerald-500">Capital</span>
            </h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#plans" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Yield Tiers</a>
            <a href="#roi" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Calculator</a>
            <Link to="/login" className="text-[9px] font-black uppercase tracking-[0.2em] text-white hover:text-emerald-500">Client Terminal</Link>
            <button 
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-emerald-500 transition-all"
            >
              Create Account
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Animated Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 w-full bg-[#020408]/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden md:hidden"
            >
              <div className="p-8 flex flex-col gap-6">
                <a href="#plans" onClick={() => setMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Yield Tiers</a>
                <a href="#roi" onClick={() => setMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Calculator</a>
                <Link to="/login" className="text-sm font-black uppercase tracking-widest">Client Terminal</Link>
                <button onClick={() => navigate('/register')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest">Create Account</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-10"
          >
            <Activity size={12} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">SECURED V3 ALPHA PROTOCOL</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-8xl font-black tracking-tight text-white leading-[0.9] mb-8 uppercase italic">
            Digital Asset <br /><span className="text-emerald-500 font-black">Management</span>
          </h2>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 mb-12 italic">
            Institutional-grade capital allocation via proprietary quantitative strategies. <br className="hidden md:block" />
            Sub-millisecond execution for the modern portfolio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-12 py-6 bg-emerald-500 text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-emerald-500/10"
            >
              Start Investing <ArrowRight size={18}/>
            </button>
            <button 
              onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_SUPPORT_NUMBER}`)}
              className="px-12 py-6 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all"
            >
              Consult Support
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="border-y border-white/5 py-10 bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
          <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Real-time market data</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Secure infrastructure</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Transparent performance</span>
        </div>
      </section>

      {/* ── ASSET CLASSES ── */}
      <section id="plans" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Capital <span className="text-emerald-500">Allocation</span> Tiers</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Choose your institutional growth protocol</p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PLANS.map((plan) => (
              <motion.div 
                key={plan.id} 
                whileHover={{ y: -8 }} 
                className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] hover:border-emerald-500/40 transition-all cursor-pointer group relative overflow-hidden" 
                onClick={() => handlePlanClick(plan.id)}
              >
                {/* Decorative background icon */}
                <div className="absolute -right-4 -top-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none">
                  <TrendingUp size={120} />
                </div>
                
                <h4 className="text-sm font-bold uppercase text-white mb-4 group-hover:text-emerald-500 transition-colors">{plan.name}</h4>
                <div className="text-3xl font-black text-emerald-500 mb-2 italic">{plan.roi}</div>
                <p className="text-slate-400 text-xs mb-6 italic">{plan.desc}</p>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-white/5">
                  Min: €{plan.min.toLocaleString()}
                </div>
                
                {loadingPlan === plan.id && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <Activity className="text-emerald-500 animate-spin" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TRUST US ── */}
      <section className="py-32 px-6 bg-[#05070a]/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16">
          {[
            { icon: <ShieldCheck className="text-emerald-500" />, title: "Secure Infrastructure", text: "Multi-layered encryption and industry-standard security protocols protecting institutional assets." },
            { icon: <Activity className="text-emerald-500" />, title: "Real-Time Execution", text: "Sub-millisecond market access combined with continuous portfolio performance tracking." },
            { icon: <Lock className="text-emerald-500" />, title: "Transparent System", text: "Verified ledger infrastructure with real-time visibility into all capital allocation tiers." }
          ].map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="mb-6 flex justify-center">{feature.icon}</div>
              <h4 className="font-black uppercase tracking-widest mb-4 text-white italic">{feature.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROI CALCULATOR ── */}
      <section id="roi" className="py-32 px-6 bg-[#05070a] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Portfolio <span className="text-emerald-500">Projection</span></h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Simulate your growth yield</p>
          </div>
          <RoiCalculator />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-20 px-6 text-center bg-[#020408]">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <Zap className="text-emerald-500" size={24} />
            <span className="font-black italic uppercase text-lg text-white">Trustra<span className="text-emerald-500">Capital</span></span>
          </div>
          
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic">
            <a href="#" className="hover:text-white transition-colors">Legal Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>

          <p className="text-[9px] font-bold text-slate-800 tracking-widest uppercase max-w-2xl leading-loose">
            &copy; {new Date().getFullYear()} TRUSTRA CAPITAL GLOBAL. <br />
            CRYPTOCURRENCY ASSETS CARRY INHERENT MARKET RISK. OPERATING UNDER TLS 1.3 ENCRYPTION.
          </p>
        </div>
      </footer>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-[100]">
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-[0.1em] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          Initialize Investment
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
