import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, ShieldCheck, Globe, Mail, AlertTriangle, ArrowRight, 
  Star, Loader2, CheckCircle2 
} from 'lucide-react';
import RoiCalculator from '../components/landing/RoiCalculator';

const REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", text: "The London node execution is flawless. My Rio Elite protocol has maintained steady yields throughout the Q1 volatility.", rating: 5 },
  { name: "Sven Lindholm", country: "Sweden", text: "Institutional grade precision. The automated protocols saved my capital during the last flash crash.", rating: 5 },
  { name: "Elena Rossi", country: "Italy", text: "Finally, a terminal that respects the complexity of European markets. The interface is high-speed and payouts are daily.", rating: 5 },
  { name: "Jameson Vance", country: "USA", text: "Operating from the New York hub, the latency is practically zero. Trustra is the 2026 benchmark for growth.", rating: 5 },
  { name: "Hiroshi Tanaka", country: "Japan", text: "The quantum protocols are legitimate. I've switched my entire portfolio to the Rio Advanced node.", rating: 5 }
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

  useEffect(() => {
    const fetchBtc = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBtcData({
          price: data.bitcoin.eur.toLocaleString('de-DE'),
          change: data.bitcoin.eur_24h_change.toFixed(2)
        });
      } catch (e) {
        console.warn("Market Data Latency: Using cached protocol values.");
      } finally {
        setLoadingBtc(false);
      }
    };
    fetchBtc();
    const interval = setInterval(fetchBtc, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden relative">
      {/* 1. Global Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[150] bg-[#020408]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Zap size={22} className="text-yellow-500 fill-current" />
            <span className="text-xl font-black tracking-tighter italic uppercase">TRUSTRA</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em]">BTC/EUR Hub</span>
            {loadingBtc ? <Loader2 size={12} className="animate-spin text-yellow-500/30" /> : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black text-yellow-500 italic">€{btcData.price}</span>
                <span className={`text-[9px] font-bold ${Number(btcData.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(btcData.change) >= 0 ? '▲' : '▼'}{Math.abs(btcData.change)}%
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-6 items-center">
            <button onClick={() => navigate('/login')} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-56 pb-32 px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={14} className="text-yellow-500" /> SECURED BY QUANTUM PROTOCOLS
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
            Wealth <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Redefined</span> <br />
            <span className="text-yellow-500 italic uppercase">Automated.</span>
          </h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-tight">
            Harness institutional-grade algorithmic trading. Precision execution across global markets with 24/7 monitoring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 shadow-2xl shadow-yellow-500/20 group">
              Start Earning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => plansRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
              View Plans
            </button>
          </div>
        </div>
      </section>

      {/* 3. The Rio Engine (Interactive Calculator) */}
      <section className="relative z-20 -mt-16 mb-24">
        <RoiCalculator />
      </section>

      {/* 4. Global Testimonials */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-16 italic">Global Network Pulse</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="space-y-4 p-8 bg-[#0a0c10] border border-white/5 rounded-3xl hover:border-yellow-500/20 transition-all group">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => <Star key={s} size={10} className="fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed italic font-medium group-hover:text-gray-200 transition-colors">"{rev.text}"</p>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">{rev.name}</p>
                  <p className="text-[9px] font-bold text-gray-600 uppercase">{rev.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Investment Tiers */}
      <section ref={plansRef} className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Investment <span className="text-yellow-500">Tiers</span></h2>
          <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.3em]">Institutional Grade Allocation Models</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-gradient-to-b ${plan.color} to-transparent border border-white/5 p-8 rounded-[2.5rem] hover:border-yellow-500/50 transition-all group relative overflow-hidden`}>
              <div className="relative z-10">
                <div className="text-[10px] font-black text-yellow-500 mb-6 uppercase tracking-widest">{plan.name}</div>
                <div className="text-4xl font-black mb-1 italic tracking-tighter">{plan.yield}</div>
                <div className="text-[9px] text-gray-500 font-bold mb-8 uppercase tracking-widest italic opacity-50">Target ROI</div>
                <div className="space-y-3 mb-10">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-60">
                    <span>Min Cap</span>
                    <span className="text-white">{plan.min}</span>
                  </div>
                  <div className="h-[1px] bg-white/5" />
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-60">
                    <span>Yield</span>
                    <span className="text-white">Daily</span>
                  </div>
                </div>
                <button onClick={() => navigate('/register')} className="w-full py-4 bg-white/5 group-hover:bg-yellow-500 group-hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">ACTIVATE</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Professional Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase flex items-center gap-3"><Globe size={20} className="text-yellow-500" /> Network Presence</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium uppercase tracking-tight">Strategic headquarters in the USA with core trading nodes in Frankfurt, London, and Tokyo.</p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase flex items-center gap-3"><Mail size={20} className="text-yellow-500" /> Support Hub</h3>
            <div className="space-y-2">
              <a href="mailto:www.infocare@gmail.com" className="block text-sm text-gray-300 font-mono hover:text-yellow-500 transition-colors underline decoration-white/10">www.infocare@gmail.com</a>
              <a href="tel:+18782241625" className="block text-sm text-gray-400 font-mono">+1 (878) 224-1625</a>
            </div>
          </div>
          <div className="space-y-6 text-right md:text-left">
            <h3 className="text-xl font-black italic uppercase flex items-center md:justify-start justify-end gap-3"><CheckCircle2 size={20} className="text-yellow-500" /> Operational</h3>
            <div className="flex items-center md:justify-start justify-end gap-2 text-green-400 font-mono text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" /> All Systems Live
            </div>
            <p className="text-[9px] text-gray-800 font-black uppercase tracking-[0.4em]">Uptime: 99.998%</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 p-10 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2 text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
            <AlertTriangle size={16} /> Protocol Risk Disclosure
          </div>
          <p className="text-[10px] text-gray-600 leading-relaxed font-medium uppercase tracking-wider">
            Automated trading involves capital risk. Trustra Capital uses proprietary AI protocols to mitigate drawdown, but past performance does not guarantee 2026 results.
          </p>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black text-gray-700 uppercase tracking-widest">
          <span>© 2026 TRUSTRA CAPITAL TRADE</span>
          <div className="flex gap-10">
            <span className="hover:text-white cursor-pointer transition-colors">Security Audit</span>
            <span className="hover:text-white cursor-pointer transition-colors">Legal Terms</span>
          </div>
          <span className="tracking-tighter italic">INTERNATIONAL GLOBAL INC.</span>
        </div>
      </footer>
    </div>
  );
}
