import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, ShieldCheck, Globe, Mail, AlertTriangle, ArrowRight, 
  Star, Loader2, CheckCircle2, TrendingUp, Menu, X 
} from 'lucide-react';
import RoiCalculator from '../components/landing/RoiCalculator';

const REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", text: "The London node execution is flawless. My Rio Elite protocol has maintained steady yields.", rating: 5 },
  { name: "Sven Lindholm", country: "Sweden", text: "Institutional grade precision. The automated protocols saved my capital during the flash crash.", rating: 5 },
  { name: "Elena Rossi", country: "Italy", text: "Finally, a terminal that respects European markets. High-speed and daily payouts.", rating: 5 },
  { name: "Jameson Vance", country: "USA", text: "Operating from the New York hub, the latency is practically zero. Trustra is the 2026 benchmark.", rating: 5 },
  { name: "Hiroshi Tanaka", country: "Japan", text: "The quantum protocols are legitimate. I've switched my entire portfolio to the Rio nodes.", rating: 5 }
];

const PLANS = [
  { id: 'starter', name: 'Rio Starter', yield: '6–9%', min: '€100', color: 'from-blue-500/20' },
  { id: 'basic', name: 'Rio Basic', yield: '9–12%', min: '€1,000', color: 'from-emerald-500/20' },
  { id: 'standard', name: 'Rio Standard', yield: '12–16%', min: '€5,000', color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', yield: '16–20%', min: '€15,000', color: 'from-orange-500/20' },
  { id: 'elite', name: 'Rio Elite', yield: '20–25%', min: '€50,000', color: 'from-yellow-500/20' }
];

export default function Landing() {
  const navigate = useNavigate();
  const plansRef = useRef(null);
  const [btcData, setBtcData] = useState({ price: '94,120', change: '+1.24' });
  const [loadingBtc, setLoadingBtc] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden relative">
      
      {/* 1. NAVIGATION - RESPONSIVE */}
      <nav className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 border-b ${scrolled ? 'bg-[#020408]/90 backdrop-blur-2xl py-4 border-white/10' : 'bg-transparent py-6 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Zap size={22} className="text-yellow-500 fill-current" />
            <span className="text-xl font-black tracking-tighter italic uppercase">TRUSTRA</span>
          </div>

          {/* Desktop Market Hub */}
          <div className="hidden lg:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
            <span className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em]">BTC/EUR</span>
            <span className="text-[11px] font-mono font-black text-yellow-500 italic">€{btcData.price}</span>
            <span className="text-[9px] font-bold text-green-400">▲1.24%</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-xl">Start Protocol</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0c10] border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <button onClick={() => navigate('/login')} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5 rounded-xl">Sign In</button>
            <button onClick={() => navigate('/register')} className="w-full py-4 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl">Get Started</button>
          </div>
        )}
      </nav>

      {/* 2. HERO - MOBILE OPTIMIZED */}
      <section className="relative pt-48 pb-20 md:pt-64 md:pb-32 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] md:h-[600px] bg-yellow-500/10 blur-[120px] rounded-full opacity-20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={14} className="text-yellow-500" /> SECURED BY QUANTUM PROTOCOLS
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-[100px] font-black tracking-tight leading-[0.9] uppercase">
            Wealth <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">Redefined</span> <br />
            <span className="text-yellow-500 italic">Automated.</span>
          </h1>
          
          <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto font-bold leading-relaxed uppercase tracking-tight px-4">
            Institutional-grade algorithmic trading. Precision execution across global hubs with 24/7 monitoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 px-4">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-yellow-500 text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-2xl">
              Start Earning <ArrowRight size={18} />
            </button>
            <button onClick={() => plansRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white/5 border border-white/10 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all">
              View Plans
            </button>
          </div>
        </div>
      </section>

      {/* 3. CALCULATOR - RESPONSIVE WIDTH */}
      <section className="px-4 md:px-6 mb-24 max-w-6xl mx-auto relative z-20">
        <RoiCalculator />
      </section>

      {/* 4. REVIEWS - GRID ADAPTATION */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-16 italic">Global Pulse</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] hover:border-yellow-500/20 transition-all group">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => <Star key={s} size={10} className="fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed italic font-medium mb-6">"{rev.text}"</p>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">{rev.name}</p>
                  <p className="text-[9px] font-bold text-gray-600 uppercase italic">{rev.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INVESTMENT TIERS - STACKING LOGIC */}
      <section ref={plansRef} className="py-24 md:py-40 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24 space-y-4">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic">Capital <span className="text-yellow-500">Nodes</span></h2>
          <p className="text-gray-600 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.5em]">Institutional Allocation models</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-gradient-to-b ${plan.color} to-transparent border border-white/5 p-8 md:p-10 rounded-[2.5rem] hover:border-yellow-500/40 transition-all group flex flex-col h-full shadow-2xl`}>
              <div className="text-[10px] font-black text-yellow-500 mb-8 uppercase tracking-[0.2em] italic">{plan.name}</div>
              <div className="text-5xl font-black mb-1 italic tracking-tighter">{plan.yield}</div>
              <div className="text-[9px] text-gray-500 font-bold mb-10 uppercase tracking-widest italic opacity-50">Target ROI</div>
              
              <div className="space-y-4 mb-12 flex-grow">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-60">
                  <span>Min</span>
                  <span className="text-white">{plan.min}</span>
                </div>
                <div className="h-[1px] bg-white/5" />
              </div>

              <button onClick={() => navigate('/register')} className="w-full py-5 bg-white/5 group-hover:bg-yellow-500 group-hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">ACTIVATE</button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOOTER - RESPONSIVE STACKING */}
      <footer className="py-20 md:py-32 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          <div className="space-y-6">
            <h3 className="text-lg font-black italic uppercase flex items-center gap-3 text-yellow-500">Network Presence</h3>
            <p className="text-xs text-gray-500 uppercase font-bold leading-relaxed tracking-wider">USA Headquarters • Frankfurt • London • Tokyo Hubs.</p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-black italic uppercase text-yellow-500">Protocol Support</h3>
            <div className="space-y-2">
              <a href="mailto:infocare.trustra@gmail.com" className="block text-xs text-gray-300 font-mono hover:text-yellow-500 transition-all break-words uppercase underline decoration-white/10">infocare.trustra@gmail.com</a>
              <p className="text-xs text-gray-500 font-mono uppercase">+1 (878) 224-1625</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black italic uppercase text-yellow-500">Infrastructure</h3>
            <div className="flex items-center gap-3 text-emerald-400 font-mono text-[10px] font-black uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#4ade80]" /> 
              Systems Operational
            </div>
          </div>
        </div>

        {/* Risk Disclaimer - Full Width on all screens */}
        <div className="max-w-7xl mx-auto mt-20 p-8 md:p-12 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2 text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
            <AlertTriangle size={16} /> Risk Disclosure
          </div>
          <p className="text-[9px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest opacity-80">
            Algorithmic trading involves significant capital risk. Trustra Capital uses AI protocols to mitigate drawdown, but 2026 performance is not guaranteed. Investors should allocate only prepared capital.
          </p>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black text-gray-700 uppercase tracking-widest text-center">
          <span>© 2026 TRUSTRA CAPITAL TRADE</span>
          <div className="flex gap-8">
            <span className="hover:text-white transition-colors">Audit</span>
            <span className="hover:text-white transition-colors">Terms</span>
          </div>
          <span className="italic opacity-40">INTL GLOBAL MGMT INC.</span>
        </div>
      </footer>
    </div>
  );
}
