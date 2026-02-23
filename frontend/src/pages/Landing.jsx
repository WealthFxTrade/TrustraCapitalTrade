import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle, Globe, Lock, Activity, 
  Mail, Phone, MapPin, ChevronRight, ArrowUpRight 
} from 'lucide-react';
import api from '../api/api';

const LandingPage = () => {
  const [btcPrice, setBtcPrice] = useState(58167.42);

  // 📈 LIVE PRICE ORACLE
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get('/market/btc-price'); 
        if (res.data?.success) setBtcPrice(res.data.price);
      } catch (err) {
        console.warn("Market Syncing...");
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      
      {/* ─── 01. NAVIGATION (FUNCTIONAL BUTTONS) ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center font-black text-black shadow-lg shadow-yellow-500/20">T</div>
            <span className="text-xl font-bold tracking-tighter uppercase">Trustra <span className="text-white/20 font-light text-[10px] tracking-[0.3em] ml-2">Capital</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link title="Sign In" to="/login" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition">Sign In</Link>
            <Link title="Create Account" to="/register" className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition shadow-lg shadow-yellow-500/20">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* ─── 02. HERO SECTION ─── */}
      <section className="pt-48 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <ShieldCheck className="w-4 h-4 text-yellow-500" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Network Compliance v8.4.1</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-[1.1]">
          Invest Smart. <br />
          <span className="text-white/30 font-light">Trade Confident.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-12 leading-relaxed">
          Access proprietary automated trading nodes with real-time profit tracking. Delivering precision-grade capital management since 2016.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16">
          <Link to="/register" className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-500 transition-all flex items-center gap-2 shadow-2xl">
            Invest Now <ChevronRight size={16} />
          </Link>
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 backdrop-blur-sm">
            <div className="text-left">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live BTC Price</div>
              <div className="text-yellow-500 font-mono font-bold">€{btcPrice.toLocaleString()}</div>
            </div>
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── 03. YIELD NODES (ALL BUTTONS: INVEST NOW) ─── */}
      <section id="nodes" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4">
          {PLAN_DATA.map((plan) => (
            <div key={plan.name} className="bg-[#0a0f1e] border border-white/5 p-8 rounded-3xl group hover:border-yellow-500/30 transition-all">
              <h3 className="text-white/40 text-[10px] font-bold uppercase mb-4 tracking-widest">{plan.name}</h3>
              <div className="text-3xl font-bold mb-1 group-hover:text-yellow-500 transition-colors">{plan.roi}</div>
              <div className="text-[9px] text-green-500 font-bold mb-6 italic uppercase">Monthly Target</div>
              <div className="text-[10px] text-white/30 mb-8 border-t border-white/5 pt-4">Entry: {plan.range}</div>
              <Link to="/register" className="block text-center py-3 bg-yellow-600 rounded-xl text-[10px] font-black text-black uppercase tracking-tighter hover:bg-yellow-500 transition-all">
                Invest Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 04. REVIEWS (VERIFIED BADGES INCLUDED) ─── */}
      <section id="reviews" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[10px] font-bold tracking-[0.5em] uppercase text-yellow-500 mb-20">Verified Deployment Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#0a0f1e] border border-white/5 relative group hover:bg-white/[0.03] transition-all">
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  <CheckCircle size={10} /> Verified
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center font-bold text-black text-sm">{r.initial}</div>
                  <div>
                    <div className="text-sm font-bold">{r.name} {r.flag}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest">{r.location}</div>
                  </div>
                </div>
                <p className="text-white/50 text-sm italic leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 05. GLOBAL FOOTPRINT ─── */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <div className="flex items-center gap-3 text-yellow-500 mb-6 uppercase text-[10px] font-bold tracking-[0.3em]">
            <Globe className="w-5 h-5" /> Global Expansion
          </div>
          <h2 className="text-4xl font-bold mb-6">Expanding the Trustra Network</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">To meet institutional demand, Trustra is establishing physical regulatory hubs across European and Asian sectors. Zurich and Singapore hubs are now active for private wealth management.</p>
          <div className="flex gap-12 border-l border-white/10 pl-8">
            <div>
              <div className="font-bold text-sm">Zürich, CH</div>
              <div className="text-[10px] text-white/20 tracking-widest uppercase mt-1">European Division</div>
            </div>
            <div>
              <div className="font-bold text-sm">Singapore, SG</div>
              <div className="text-[10px] text-white/20 tracking-widest uppercase mt-1">Asian Hub</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-600/5 border border-yellow-600/20 p-10 rounded-[40px] shadow-2xl shadow-yellow-500/5">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-yellow-500"><Lock className="w-6 h-6" /> Regulatory Hub</h3>
          <p className="text-sm text-slate-500 leading-relaxed">To comply with 2026 Asset Security Directives, KYC is mandatory for all withdrawals and higher-tier deployments. ISO 27001 Certified & GDPR Compliant.</p>
        </div>
      </section>

      {/* ─── 06. FOOTER (ADDRESSES & RISK DISCLAIMER) ─── */}
      <footer className="border-t border-white/5 bg-black/40 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center font-black text-black">T</div>
              <span className="font-bold tracking-widest">TRUSTRA CAPITAL</span>
            </div>
            <div className="space-y-4 text-white/40 text-[11px] uppercase tracking-widest leading-loose">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-yellow-600 mt-1" />
                <p>Global HQ: Brandschenkestrasse 90, 8002 <br /> Zürich, Switzerland</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-yellow-600 mt-1" />
                <p>USA Operations: 1201 Orange St, <br /> Wilmington, DE 19801, USA</p>
              </div>
            </div>
          </div>
          <div className="md:text-right space-y-6">
            <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.3em]">Direct Contact</h4>
            <div className="space-y-3">
              <a href="mailto:infocare@gmail.com" className="flex md:justify-end items-center gap-3 text-sm text-white/40 hover:text-white transition">
               www.infocare@gmail.com <Mail size={14} />
              </a>
              <a href="tel:+18782241625" className="flex md:justify-end items-center gap-3 text-sm text-white/40 hover:text-white transition">
                +1 (878) 224-1625 <Phone size={14} />
              </a>
            </div>
            <div className="flex md:justify-end gap-2 pt-4">
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/40">ISO 27001</div>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/40">GDPR</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 border-t border-white/5">
          <div className="text-[11px] font-bold text-yellow-600 uppercase tracking-[0.3em] mb-4">Risk & Automation Protocol</div>
          <p className="text-[10px] text-white/20 uppercase leading-relaxed tracking-wider">
            Trustra utilizes an Audit-Certified Automated Trading System designed to mitigate market exposure. High-frequency model, capital loss mitigation [1.1]. Digital asset management involves market volatility. Automated preservation protocols help mitigate risk, but do not eliminate inherent market risk. Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.
          </p>
        </div>
      </footer>
    </div>
  );
};

const PLAN_DATA = [
  { name: 'Rio Starter', roi: '6–9%', range: '€100 – €999' },
  { name: 'Rio Basic', roi: '9–12%', range: '€1,000 – €4,999' },
  { name: 'Rio Standard', roi: '12–16%', range: '€5,000 – €14,999' },
  { name: 'Rio Advanced', roi: '16–20%', range: '€15,000 – €49,999' },
  { name: 'Rio Elite', roi: '20–25%', range: '€50,000 – ∞' },
];

const REVIEWS = [
  { initial: 'M', name: 'Marco Vieri', flag: '🇮🇹', location: 'Milan, Italy', text: "The Rio Elite node has maintained a consistent 22% ROI. The automated risk management is unlike anything I've seen in Milan." },
  { initial: 'Y', name: 'Yuki Tanaka', flag: '🇯🇵', location: 'Tokyo, Japan', text: "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors." },
  { initial: 'S', name: 'Sebastian Müller', flag: '🇩🇪', location: 'Berlin, Germany', text: "The automated node handled market volatility perfectly. Zero manual intervention needed. True hands-off wealth management." }
];

export default LandingPage;

