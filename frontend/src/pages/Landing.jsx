// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Globe, ArrowUpRight, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

const plans = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9%', entry: '€100 – €999' },
  { id: 'basic', name: 'Rio Basic', roi: '9–12%', entry: '€1,000 – €4,999' },
  { id: 'standard', name: 'Rio Standard', roi: '12–16%', entry: '€5,000 – €14,999' },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20%', entry: '€15,000 – €49,999' },
  { id: 'elite', name: 'Rio Elite', roi: '20–25%', entry: '€50,000 – ∞' },
];

const testimonials = [
  { name: 'Marco Vieri 🇮🇹', loc: 'Milan, Italy', text: "The Rio Elite node has maintained a consistent 22% ROI. The automated risk management is unlike anything I've seen in Milan." },
  { name: 'Yuki Tanaka 🇯🇵', loc: 'Tokyo, Japan', text: "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors." },
  { name: 'Sebastian Müller 🇩🇪', loc: 'Berlin, Germany', text: "The automated node handled market volatility perfectly. Zero manual intervention needed. True hands-off wealth management." },
  { name: 'Aisha Khan 🇦🇪', loc: 'Dubai, UAE', text: "Highly efficient automated trading. Minimal effort and excellent returns with the Rio Advanced node." },
  { name: 'Luis Carvalho 🇧🇷', loc: 'São Paulo, Brazil', text: "Trustra’s system handles market swings brilliantly. Rio Basic node gave consistent monthly profits." }
];

export default function Landing() {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState(55502);
  const [loading, setLoading] = useState(false);

  // Live Price Sync Logic
  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://blockchain.info');
        const data = await res.json();
        setBtcPrice(data.EUR.last);
      } catch (e) { console.error("Price sync error"); }
      finally { setLoading(false); }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-cyan-500/30">
      {/* Hero Section */}
      <header className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Trustra Capital
          </h1>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <button onClick={() => navigate('/login')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-12 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 active:scale-95">
              SIGN IN
            </button>
            <button onClick={() => navigate('/register')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 px-12 rounded-xl transition-all active:scale-95">
              CREATE ACCOUNT
            </button>
          </div>

          <p className="text-xs text-gray-500 uppercase tracking-[0.4em] font-bold mb-6">Network Compliance v8.4.1</p>
          <h2 className="text-4xl md:text-7xl font-black italic mb-10 leading-tight">
            Invest Smart<span className="text-cyan-400">.</span><br />Trade Confident<span className="text-cyan-400">.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Access proprietary automated trading nodes with real-time profit tracking. Delivering precision-grade capital management since 2016.
          </p>
        </div>
      </header>

      {/* Live BTC Price */}
      <section className="py-12 bg-white/[0.02] border-y border-white/5 text-center">
        <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2 flex justify-center items-center gap-2">
          {loading && <Loader2 size={12} className="animate-spin" />} Live BTC Price
        </p>
        <div className="text-6xl md:text-7xl font-black tracking-tighter">
          <span className="text-gray-500 mr-2">€</span>{btcPrice.toLocaleString()}
        </div>
        <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest">Updated real-time • Market prices are volatile</p>
      </section>

      {/* Investment Plans */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-[#0a0c10] border border-white/5 p-8 rounded-3xl hover:border-cyan-500/50 transition-all group">
              <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm">{plan.name}</h3>
              <div className="text-4xl font-black mb-1">{plan.roi}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 font-bold italic">Monthly Target</div>
              <div className="text-sm font-medium text-gray-300 mb-8 pt-4 border-t border-white/5">Entry: {plan.entry}</div>
              <button onClick={() => navigate('/register', { state: { plan: plan.id } })} className="flex items-center justify-center w-full py-4 bg-cyan-600 hover:bg-cyan-500 transition-colors rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95">
                Invest Now <ArrowUpRight size={14} className="ml-2" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#080a0e] border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16 uppercase tracking-tighter">Verified Deployment Feedback</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#0f1218] p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black">{t.name.charAt(0)}</div>
                    <div><div className="font-bold text-sm">{t.name}</div><div className="text-xs text-gray-500">{t.loc}</div></div>
                  </div>
                  <div className="flex items-center text-[10px] text-green-500 font-bold uppercase border border-green-500/20 px-2 py-1 rounded">
                    <ShieldCheck size={12} className="mr-1" /> Verified
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-16 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-3"><Globe className="text-cyan-500" size={32} /><h3 className="text-2xl font-black uppercase">Global Reach</h3></div>
            <div className="text-sm text-gray-400 space-y-4">
              <div><p className="font-bold text-white uppercase tracking-widest">Zürich, CH</p><p>European Division Hub</p></div>
              <div><p className="font-bold text-white uppercase tracking-widest">Singapore, SG</p><p>Asian Operations Center</p></div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Corporate HQ Locations</h4>
            <div className="space-y-4 text-sm text-gray-300 font-medium">
              <div className="flex items-start justify-center md:justify-start gap-3"><MapPin size={18} className="text-cyan-500 shrink-0" /><p>Brandschenkestrasse 90, 8002 Zürich, Switzerland</p></div>
              <div className="flex items-start justify-center md:justify-start gap-3"><MapPin size={18} className="text-cyan-500 shrink-0" /><p>1201 Orange St, Wilmington, DE 19801, USA</p></div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Direct Support Hub</h4>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail size={18} className="text-cyan-500" />
                <a href="mailto:www.infocare@gmail.com" className="hover:text-cyan-400 underline decoration-cyan-500/20 underline-offset-4">www.infocare@gmail.com</a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Phone size={18} className="text-cyan-500" />
                <a href="tel:+18782241625" className="hover:text-cyan-400 font-mono">+1 (878) 224-1625</a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.35em] leading-loose max-w-4xl mx-auto">
            Risk & Automation Protocol: Trustra utilizes an Audit-Certified Automated Trading System. <br />
            Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.
          </p>
        </div>
      </footer>
    </div>
  );
}

