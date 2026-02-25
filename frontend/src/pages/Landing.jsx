import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, Activity, MapPin, Mail, Phone, ChevronRight, Copy } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from '../context/AuthContext';
import { useBtcPrice } from '../hooks/useBtcPrice';
import api from '../api/api';
import { toast } from 'react-hot-toast';

const PLAN_DATA = [
  { name: 'Rio Starter', roi: '6–9%', range: '€100 – €999', amount: 100 },
  { name: 'Rio Basic', roi: '9–12%', range: '€1,000 – €4,999', amount: 1000 },
  { name: 'Rio Standard', roi: '12–16%', range: '€5,000 – €14,999', amount: 5000 },
  { name: 'Rio Advanced', roi: '16–20%', range: '€15,000 – €49,999', amount: 15000 },
  { name: 'Rio Elite', roi: '20–25%', range: '€50,000 – ∞', amount: 50000 },
];

const REVIEWS = [
  { initial: 'M', name: 'Marco Vieri', flag: '🇮🇹', location: 'Milan, Italy', text: "The Rio Elite node has maintained a consistent 22% ROI. The automated risk management is unlike anything I've seen in Milan." },
  { initial: 'Y', name: 'Yuki Tanaka', flag: '🇯🇵', location: 'Tokyo, Japan', text: "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors." },
  { initial: 'S', name: 'Sebastian Müller', flag: '🇩🇪', location: 'Berlin, Germany', text: "The automated node handled market volatility perfectly. Zero manual intervention needed. True hands-off wealth management." },
  { initial: 'A', name: 'Aisha Khan', flag: '🇦🇪', location: 'Dubai, UAE', text: "Highly efficient automated trading. Minimal effort and excellent returns with the Rio Advanced node." },
  { initial: 'L', name: 'Luis Carvalho', flag: '🇧🇷', location: 'São Paulo, Brazil', text: "Trustra’s system handles market swings brilliantly. Rio Basic node gave consistent monthly profits." }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const btcPrice = useBtcPrice(60000);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userBTCAddress, setUserBTCAddress] = useState('');

  const openBTCModal = async (plan) => {
    if (!user) return navigate('/login'); // redirect unauthenticated users

    try {
      const res = await api.get(`/api/deposit-address?plan=${plan.name}`);
      setUserBTCAddress(res.data.address || '');
      setSelectedPlan(plan);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching deposit address', err);
      toast.error('Unable to generate deposit address. Try again later.');
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userBTCAddress);
    toast.success('Bitcoin address copied to clipboard!');
  };

  const investNowButton = (plan) => (
    <button
      onClick={() => openBTCModal(plan)}
      className="block w-full text-center py-3 bg-yellow-600 rounded-xl text-[10px] font-black text-black uppercase tracking-tighter hover:bg-yellow-500 transition-all"
    >
      Invest Now
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center font-black text-black shadow-lg shadow-yellow-500/20">T</div>
            <span className="text-xl font-bold tracking-tighter uppercase">Trustra <span className="text-white/20 font-light text-[10px] tracking-[0.3em] ml-2">Capital</span></span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-widest hover:text-yellow-500">Sign In</Link>
            <Link to="/register" className="text-[10px] font-black uppercase tracking-widest hover:text-yellow-500">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-48 pb-20 px-6 text-center relative overflow-hidden">
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
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 backdrop-blur-sm">
            <div className="text-left">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live BTC Price</div>
              <div className="text-yellow-500 font-mono font-bold">€{btcPrice?.toLocaleString() || 'SYNCHRONIZING...'}</div>
            </div>
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          </div>
        </div>
      </section>

      {/* INVESTMENT PLANS */}
      <section id="nodes" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4">
          {PLAN_DATA.map(plan => (
            <div key={plan.name} className="bg-[#0a0f1e] border border-white/5 p-8 rounded-3xl group hover:border-yellow-500/30 transition-all">
              <h3 className="text-white/40 text-[10px] font-bold uppercase mb-4 tracking-widest">{plan.name}</h3>
              <div className="text-3xl font-bold mb-1 group-hover:text-yellow-500 transition-colors">{plan.roi}</div>
              <div className="text-[9px] text-green-500 font-bold mb-6 italic uppercase">Monthly Target</div>
              <div className="text-[10px] text-white/30 mb-8 border-t border-white/5 pt-4">Entry: {plan.range}</div>
              {investNowButton(plan)}
            </div>
          ))}
        </div>
      </section>

      {/* BTC MODAL */}
      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0f1e] rounded-3xl p-8 max-w-sm w-full text-center relative">
            <button className="absolute top-4 right-4 text-white/40 hover:text-white" onClick={() => setModalOpen(false)}>✕</button>
            <h3 className="text-xl font-bold mb-4">{selectedPlan.name} Investment</h3>
            <p className="mb-2 text-white/50">Send BTC to the address below:</p>
            <p className="mb-4 font-mono text-yellow-500">{userBTCAddress}</p>
            <p className="mb-4 text-white/50">Amount: <span className="font-bold">{(selectedPlan.amount / btcPrice).toFixed(6)} BTC</span></p>
            <QRCodeSVG
              value={`bitcoin:${userBTCAddress}?amount=${(selectedPlan.amount / btcPrice).toFixed(6)}`}
              size={150}
              className="mx-auto mb-4"
            />
            <button
              onClick={copyAddress}
              className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-600 rounded-xl text-black font-bold hover:bg-yellow-500 transition"
            >
              Copy Address <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      {/* REVIEWS */}
      <section id="reviews" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[10px] font-bold tracking-[0.5em] uppercase text-yellow-500 mb-20">Verified Deployment Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
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

      {/* GLOBAL EXPANSION */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div>
            <h3 className="text-lg font-bold mb-2">Zürich, CH</h3>
            <p className="text-white/50 text-sm">European Division</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Singapore, SG</h3>
            <p className="text-white/50 text-sm">Asian Hub</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/40 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center text-[10px] text-white/40">
          <p className="mb-2">Global HQ: Brandschenkestrasse 90, 8002 Zürich, Switzerland</p>
          <p className="mb-2">USA Operations: 1201 Orange St, Wilmington, DE 19801, USA</p>
          <p className="mb-2">Direct Contact: www.infocare@gmail.com | +1 (878) 224-1625</p>
          <p className="italic mt-6 text-[9px]">Risk & Automation Protocol: Trustra utilizes an Audit-Certified Automated Trading System. Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.</p>
        </div>
      </footer>
    </div>
  );
}
