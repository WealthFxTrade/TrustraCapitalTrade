import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../components/VerifiedBadge";
import { TrendingUp, ShieldCheck, Zap, Wallet, Globe, MapPin, Mail, Phone } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [btcPrice, setBtcPrice] = useState(null);

  // Real-time BTC Price Sync (EUR)
  useEffect(() => {
    const fetchBTC = async () => {
      try {
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
        );
        setBtcPrice(res.data.bitcoin.eur);
      } catch (err) {
        console.error("BTC Sync Error:", err);
      }
    };
    fetchBTC();
    const interval = setInterval(fetchBTC, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinNode = (node) => {
    if (user) {
      navigate("/dashboard", { state: { autoOpenNode: node.name } });
    } else {
      navigate("/register", { state: { selectedPlan: node.name, minAmount: node.min } });
    }
  };

  const nodes = [
    { name: "Rio Starter", min: 100, max: 999, rate: "6–9%" },
    { name: "Rio Basic", min: 1000, max: 4999, rate: "9–12%" },
    { name: "Rio Standard", min: 5000, max: 14999, rate: "12–16%" },
    { name: "Rio Advanced", min: 15000, max: 49999, rate: "16–20%" },
    { name: "Rio Elite", min: 50000, max: Infinity, rate: "20–25%" },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 selection:bg-blue-500/30">
      {/* Navigation Header */}
      <header className="px-6 lg:px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <TrendingUp className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform" />
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
            Trustra <VerifiedBadge />
          </h1>
        </div>

        <div className="flex gap-4">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Open Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-2xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </header>

      <main className="px-6 lg:px-20 py-16 space-y-32 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Zap size={14} /> Global Precision Asset Management
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
            Invest Smart.<br />Trade Confident.
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Access proprietary automated trading nodes with real-time profit tracking.
            Delivering precision-grade capital management since 2016.
          </p>

          <div className="inline-block p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-[#0a0d14] px-10 py-6 rounded-[2.3rem] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Live BTC Price (EUR)</h3>
              <p className="text-4xl font-mono font-black text-blue-500 tracking-tighter">
                {btcPrice ? `€${btcPrice.toLocaleString()}` : "SYNCING..."}
              </p>
            </div>
          </div>
        </section>

        {/* Protocol Nodes Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tight">Yield Protocol Nodes</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Select your deployment tier</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {nodes.map((node) => (
              <div
                key={node.name}
                className="group bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] text-center hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <h4 className="font-black text-white uppercase italic tracking-tighter text-lg">{node.name}</h4>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Capital Range</p>
                    <p className="text-white font-mono font-bold text-sm">
                      €{node.min.toLocaleString()} – {node.max === Infinity ? '∞' : `€${node.max.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="py-4 px-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-500 font-black text-xl tracking-tighter">{node.rate}</p>
                    <p className="text-emerald-500/60 text-[8px] font-black uppercase tracking-widest">Monthly Target</p>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinNode(node)}
                  className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                >
                  Join Node
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Global Branches & Expansion Section */}
        <section className="py-20 border-y border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                <Globe size={12} /> Global Footprint
              </div>
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-tight">
                Expanding the <br /><span className="text-blue-500">Trustra Network</span>
              </h3>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                To meet the demand of our growing institutional clientele, Trustra is establishing physical regulatory hubs across three continents.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                  <div className="text-blue-500 font-black text-xs uppercase tracking-widest">European Division</div>
                  <p className="text-white font-bold italic">Zürich, Switzerland</p>
                  <p className="text-slate-500 text-[10px] uppercase">Compliance & Asset Custody</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                  <div className="text-blue-500 font-black text-xs uppercase tracking-widest">Asian Hub</div>
                  <p className="text-white font-bold italic">Singapore</p>
                  <p className="text-slate-500 text-[10px] uppercase">High-Frequency Nodes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600/5 rounded-[3rem] p-8 border border-blue-500/10 relative overflow-hidden group">
               <ShieldCheck className="absolute -right-10 -bottom-10 h-64 w-64 text-blue-500/5 group-hover:text-blue-500/10 transition-all duration-700" />
               <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Regulatory-Grade Verification</h4>
               <p className="text-slate-400 text-sm leading-relaxed mb-6">
                 To maintain the highest security standards and comply with 2026 Asset Security Directives, identity verification (KYC) is mandatory for all withdrawals and higher-tier deployments.
               </p>
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  <span className="flex items-center gap-1"><VerifiedBadge /> ISO 27001</span>
                  <span className="flex items-center gap-1"><VerifiedBadge /> GDPR COMPLIANT</span>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#020408] border-t border-white/5 px-6 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6 col-span-1 md:col-span-2">
             <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Trustra</h1>
             </div>
             <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
               Digital asset management involves market volatility. Past performance does not guarantee future results. 
               Audit Certified Protocol v8.4.1 — © 2016–2026 Trustra Capital Trade.
             </p>
          </div>

          <div className="space-y-4">
             <h5 className="text-white font-black text-xs uppercase tracking-widest">Global HQ</h5>
             <ul className="space-y-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                <li className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> USA Operations Center</li>
                <li className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /> infocare@gmail.com</li>
                <li className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> +1 (878) 224-1625</li>
             </ul>
          </div>

          <div className="space-y-4">
             <h5 className="text-white font-black text-xs uppercase tracking-widest">Compliance</h5>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-slate-500 leading-tight italic">
                  Licensed and regulated under International Finance Commission guidelines 2026-F44.
                </p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

