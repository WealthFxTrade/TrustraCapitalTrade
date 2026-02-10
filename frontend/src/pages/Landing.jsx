import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../components/VerifiedBadge";
import { TrendingUp, ShieldCheck, Zap, Wallet, Globe } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [btcPrice, setBtcPrice] = useState(null);

  // Real-time BTC Price Sync (EUR)
  useEffect(() => {
    const fetchBTC = async () => {
      try {
        // ✅ Fixed full endpoint
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
        );
        setBtcPrice(res.data.bitcoin.eur);
      } catch (err) {
        console.error("BTC Sync Error:", err);
      }
    };
    fetchBTC();
    const interval = setInterval(fetchBTC, 30000); // 30s update interval
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
    { name: "Rio Starter", min: 100, max: 999, rate: "6–9%", pool: 88 },
    { name: "Rio Basic", min: 1000, max: 4999, rate: "9–12%", pool: 72 },
    { name: "Rio Standard", min: 5000, max: 14999, rate: "12–16%", pool: 94 },
    { name: "Rio Advanced", min: 15000, max: 49999, rate: "16–20%", pool: 65 },
    { name: "Rio Elite", min: 50000, max: Infinity, rate: "20–25%", pool: 40 },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 selection:bg-blue-500/30">
      {/* Navigation Header */}
      <header className="px-6 lg:px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 group">
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

      <main className="px-6 lg:px-20 py-16 space-y-24 max-w-7xl mx-auto">
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
          
          {/* Live BTC Price Widget */}
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

        {/* Global Verification Section */}
        <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px] -z-10" />
          <ShieldCheck className="mx-auto text-blue-500" size={64} />
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Regulatory-Grade Identity Verification</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              To maintain the highest security standards and comply with 2026 Asset Security Directives, 
              identity verification (KYC) is mandatory for all withdrawals and higher-tier deployments.
            </p>
          </div>
          <button
            onClick={() => navigate("/kyc")}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
          >
            Submit KYC Documents
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0d14] px-6 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-black text-white italic uppercase tracking-tighter">Trustra</span>
            </div>
            <p className="text-slate-600 text-xs font-bold leading-loose uppercase tracking-widest">
              Digital asset management involves market volatility. Past performance does not guarantee future results.
            </p>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-white font-black uppercase italic tracking-widest flex items-center gap-2">
              <Globe size={16} className="text-blue-500" /> Corporate HQ
            </h5>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] space-y-2">
              <p>USA Operations Center</p>
              <p>Email: <a href="mailto:infocare@gmail.com" className="text-blue-500 underline">infocare@gmail.com</a></p>
              <p>Support: +1 (878) 224-1625</p>
            </div>
          </div>

          <div className="space-y-6 text-right md:text-left">
            <h5 className="text-white font-black uppercase italic tracking-widest">Network Compliance</h5>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] italic leading-loose">
              © 2016–2026 Trustra Capital Trade<br />
              Audit Certified Protocol v8.4.1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
