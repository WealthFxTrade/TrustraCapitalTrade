import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Globe, Lock, ArrowUpRight, Activity, 
  ChevronRight, Mail, Phone, CheckCircle2, MapPin 
} from 'lucide-react';
import api from '../api';

const LandingPage = () => {
  const [btcPrice, setBtcPrice] = useState(58167.42);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await api.get('/market/btc-price'); 
        if (res.data.success) setBtcPrice(res.data.price);
      } catch (err) {
        console.warn("Market Feed Offline.");
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30 font-sans">
      
      {/* ─── 01. NAVIGATION ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center font-black text-black shadow-lg shadow-yellow-500/20">T</div>
            <span className="text-xl font-bold tracking-tighter">TRUSTRA <span className="text-white/40 font-light uppercase text-[10px] tracking-[0.3em] ml-2">CAPITAL</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
            <a href="#nodes" className="text-white/50 hover:text-yellow-500 transition-colors">Yield Nodes</a>
            <a href="#reviews" className="text-white/50 hover:text-yellow-500 transition-colors">Trust Index</a>
            <Link to="/login" className="text-white/50 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full transition-all transform hover:scale-105">
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── 02. HERO SECTION ─── */}
      <section className="relative pt-48 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <ShieldCheck className="w-4 h-4 text-yellow-500" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Network Compliance v8.4.1</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
            Invest Smart. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Trade Confident.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Access proprietary automated trading nodes with real-time profit tracking. Delivering precision-grade capital management since 2016.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/register" className="w-full md:w-auto px-10 py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all">
              Invest Now <ChevronRight className="w-4 h-4" />
            </Link>
            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
              <div className="text-left">
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Live BTC Price</div>
                <div className="font-mono font-bold text-yellow-500">€{btcPrice.toLocaleString()}</div>
              </div>
              <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03. YIELD NODES ─── */}
      <section id="nodes" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PLAN_DATA.map((plan) => (
              <div key={plan.name} className="bg-[#0a0f1e] border border-white/5 p-8 rounded-3xl hover:border-yellow-600/50 transition-all">
                <h3 className="text-white/40 text-[10px] font-bold uppercase mb-4 tracking-widest">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">{plan.roi}</div>
                <div className="text-[9px] text-green-500 font-bold mb-6 italic">MONTHLY TARGET</div>
                <div className="text-xs text-white/40 mb-8 border-t border-white/5 pt-4">Entry: {plan.range}</div>
                <Link to="/register" className="block text-center py-3 bg-white/5 rounded-xl text-xs font-bold hover:bg-yellow-600 hover:text-black transition-all">Deploy Node</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 04. REVIEWS ─── */}
      <section id="reviews" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-xs font-bold tracking-[0.4em] uppercase text-yellow-500 mb-16">Verified Deployment Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center font-bold text-black">{r.initial}</div>
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

      {/* ─── 05. GLOBAL & COMPLIANCE ─── */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <div className="flex items-center gap-3 text-yellow-500 mb-6 uppercase text-xs font-bold tracking-widest">
            <Globe className="w-5 h-5" /> Global Footprint
          </div>
          <h2 className="text-4xl font-bold mb-6">Expanding the Trustra Network</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">To meet institutional demand, Trustra is establishing physical regulatory hubs across European and Asian sectors. Zurich and Singapore hubs are now active.</p>
          <div className="flex gap-12">
            <div>
              <div className="font-bold">Zürich, CH</div>
              <div className="text-xs text-white/30 tracking-widest uppercase">European Div.</div>
            </div>
            <div>
              <div className="font-bold">Singapore, SG</div>
              <div className="text-xs text-white/30 tracking-widest uppercase">Asian Hub</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-600/5 border border-yellow-600/20 p-10 rounded-[40px]">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-500" /> Regulatory Hub</h3>
          <p className="text-sm text-slate-500 leading-relaxed">To comply with 2026 Asset Security Directives, KYC is mandatory for all withdrawals and higher-tier deployments. ISO 27001 Certified.</p>
        </div>
      </section>

      {/* ─── 06. FOOTER (ADDRESS & DISCLAIMER) ─── */}
      <footer className="border-t border-white/5 bg-black/40 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center font-black text-black">T</div>
                <span className="font-bold tracking-widest">TRUSTRA CAPITAL</span>
              </div>
              <div className="space-y-6 text-white/40 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-600 mt-1 shrink-0" />
                  <p>Global HQ: Brandschenkestrasse 90, 8002 <br /> Zürich, Switzerland</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-600 mt-1 shrink-0" />
                  <p>USA Operations Center: 1201 Orange St, <br /> Wilmington, DE 19801, USA</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-sm">
              <h4 className="font-bold text-white/80 uppercase tracking-widest text-[10px]">Direct Contact</h4>
              <a href="mailto:infocare@gmail.com" className="flex items-center gap-3 text-white/40 hover:text-yellow-500 transition-colors">
                <Mail className="w-4 h-4" /> infocare@gmail.com
              </a>
              <div className="flex items-center gap-3 text-white/40">
                <Phone className="w-4 h-4" /> +1 (878) 224-1625
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold text-white/80 uppercase tracking-widest text-[10px]">Certification</h4>
               <div className="flex gap-2">
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold">ISO 27001</div>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold">GDPR</div>
               </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12">
            <div className="text-[11px] font-bold text-yellow-600 uppercase tracking-[0.3em] mb-4">Risk & Automation Protocol</div>
            <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-wider max-w-4xl">
              Trustra utilizes an Audit-Certified Automated Trading System designed to mitigate market exposure. 
              High-frequency model, capital loss mitigation [1.1]. Digital asset management involves market volatility. 
              Automated preservation protocols help mitigate, but do not eliminate, inherent risk. 
              Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.
            </p>
          </div>
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

