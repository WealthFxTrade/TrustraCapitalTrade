import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, ShieldCheck, ArrowRight,
  Star, Menu, X, Phone, Mail
} from 'lucide-react';
import RoiCalculator from './RoiCalculator';

const REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", text: "The London node execution is flawless. My Rio Elite protocol has maintained steady yields." },
  { name: "Sven Lindholm", country: "Sweden", text: "Institutional grade precision. The automated protocols saved my capital during the flash crash." },
  { name: "Elena Rossi", country: "Italy", text: "Finally, a terminal that respects European markets. High-speed and daily payouts." },
  { name: "Jameson Vance", country: "USA", text: "Operating from the New York hub, the latency is practically zero. Trustra is the 2026 benchmark." },
  { name: "Hiroshi Tanaka", country: "Japan", text: "The quantum protocols are legitimate. I've switched my entire portfolio to the Rio nodes." }
];

const PLANS = [
  { id: 'starter', name: 'Rio Starter', yield: '6–9%', min: '€100', color: 'from-blue-500/20' },
  { id: 'basic', name: 'Rio Basic', yield: '9–12%', min: '€1,000', color: 'from-emerald-500/20' },
  { id: 'standard', name: 'Rio Standard', yield: '12–16%', min: '€5,000', color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', yield: '16–20%', min: '€15,000', color: 'from-orange-500/20' },
  { id: 'elite', name: 'Rio Elite', yield: '20–25%', min: '€50,000', color: 'from-yellow-500/20' }
];

const PlansGrid = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-5 bg-[#020408]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Select Your <span className="text-yellow-500">Node Protocol</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">Choose a liquidity tier to begin automated yield execution.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative group overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b ${plan.color} to-transparent p-6 transition-all hover:border-white/20 hover:-translate-y-1`}>
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-1">{plan.name}</h3>
                <div className="text-3xl font-black italic mb-6 text-yellow-500">{plan.yield}</div>
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-gray-400"><span>Min Deposit</span><span className="font-bold text-white">{plan.min}</span></div>
                </div>
                {/* ✅ CHANGE: Activate Node -> Activate Plan */}
                <button 
                  onClick={() => navigate('/signup', { state: { plan: plan.id } })} 
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all"
                >
                  Activate Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const plansRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden relative">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 border-b ${scrolled ? 'bg-[#020408]/90 backdrop-blur-2xl py-4 border-white/10' : 'bg-transparent py-6 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Zap size={22} className="text-yellow-500 fill-current" />
            <span className="text-xl font-black tracking-tighter italic uppercase">TRUSTRA</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-6 items-center">
            {/* ✅ CHANGE: Sign In -> Login */}
            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Login</button>
            {/* ✅ CHANGE: Start Protocol -> Create Account */}
            <button onClick={() => navigate('/signup')} className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">Create Account</button>
          </div>

          <button className="md:hidden p-2 text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0c10] border-b border-white/20 p-8 flex flex-col gap-5 animate-in slide-in-from-top duration-300">
            {/* ✅ CHANGE: Login Protocol -> Login */}
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full py-4 text-[11px] font-black uppercase tracking-widest text-white border border-white/10 rounded-2xl">Login</button>
            {/* ✅ CHANGE: Initialize Account -> Create Account */}
            <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="w-full py-4 bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-500/20">Create Account</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-48 pb-20 md:pt-64 md:pb-32 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={14} className="text-yellow-500" /> SECURED BY QUANTUM PROTOCOLS
          </div>
          <h1 className="text-5xl md:text-[100px] font-black tracking-tight leading-[0.9] uppercase">
            Wealth <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">Redefined</span> <br />
            <span className="text-yellow-500 italic">Automated.</span>
          </h1>
          <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto font-bold uppercase">
            Institutional-grade algorithmic trading. Precision execution across global hubs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            {/* ✅ Action points to /signup */}
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-yellow-500 text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3">Start Earning <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 mb-24 max-w-6xl mx-auto">
        <RoiCalculator />
      </section>

      {/* Reviews */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-16 italic w-full">Global Pulse</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] group">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, s) => <Star key={s} size={10} className="fill-yellow-500 text-yellow-500" />)}</div>
                <p className="text-[11px] text-gray-400 leading-relaxed italic mb-6">"{rev.text}"</p>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-white uppercase">{rev.name}</p>
                  <p className="text-[9px] font-bold text-gray-600 uppercase italic">{rev.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div ref={plansRef}><PlansGrid /></div>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h3 className="text-lg font-black italic uppercase text-yellow-500">Network Presence</h3>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider leading-loose">USA Headquarters • Frankfurt • London • Tokyo Hubs.</p>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-black italic uppercase text-yellow-500">Protocol Support</h3>
            <div className="space-y-4">
              <a href="mailto:www.infocare@gmail.com" className="flex items-center gap-3 text-xs text-gray-300 font-mono hover:text-yellow-500 transition-all uppercase underline decoration-white/10">
                <Mail size={14} className="text-yellow-500" /> www.infocare@gmail.com
              </a>
              <a href="tel:+18782241625" className="flex items-center gap-3 text-xs text-gray-300 font-mono hover:text-yellow-500 transition-all uppercase">
                <Phone size={14} className="text-yellow-500" /> +1 (878) 224-1625
              </a>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-black italic uppercase text-yellow-500">Infrastructure</h3>
            <div className="flex items-center gap-3 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Systems Operational
            </div>
            <p className="text-[9px] text-gray-600 uppercase tracking-tighter leading-relaxed">
              Risk Disclosure: Algorithmic trading involves significant risk. 2026 performance is monitored but not guaranteed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
