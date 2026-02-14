import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../components/VerifiedBadge";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [btcPrice, setBtcPrice] = useState(null);

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
      navigate("/register", {
        state: { selectedPlan: node.name, minAmount: node.min },
      });
    }
  };

  const nodes = [
    { name: "Rio Starter", min: 100, max: 999, rate: "6–9%" },
    { name: "Rio Basic", min: 1000, max: 4999, rate: "9–12%" },
    { name: "Rio Standard", min: 5000, max: 14999, rate: "12–16%" },
    { name: "Rio Advanced", min: 15000, max: 49999, rate: "16–20%" },
    { name: "Rio Elite", min: 50000, max: Infinity, rate: "20–25%" },
  ];

  const reviews = [
    {
      name: "Marco Vieri",
      country: "Italy",
      flag: "🇮🇹",
      text:
        "The Rio Elite node has maintained a consistent 22% ROI. The automated risk management is unlike anything I've seen in Milan.",
    },
    {
      name: "Yuki Tanaka",
      country: "Japan",
      flag: "🇯🇵",
      text:
        "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors.",
    },
    {
      name: "Lars Sørensen",
      country: "Denmark",
      flag: "🇩🇰",
      text:
        "Security is my priority. Knowing the automated system mitigates human error gives me the confidence to deploy higher tiers.",
    },
    {
      name: "Oliver Bennett",
      country: "UK",
      flag: "🇬🇧",
      text:
        "Exceptional platform. The automated balancing ensures that market dips don't affect my principal capital. Very hard to see a loss.",
    },
    {
      name: "Sebastian Müller",
      country: "Germany",
      flag: "🇩🇪",
      text:
        "The automated node handled market volatility perfectly. Zero manual intervention needed. True hands-off wealth management.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 selection:bg-blue-500/30">
      {/* Header */}
      <header className="px-6 lg:px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#05070a]/80">
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => navigate("/")}
        >
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
        {/* Hero */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Zap size={14} /> Global Precision Asset Management (2026)
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
            Invest Smart.<br />
            Trade Confident.
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
            Access proprietary automated trading nodes with real-time profit tracking.
            Delivering precision-grade capital management since 2016.
          </p>
          <div className="inline-block p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-[#0a0d14] px-10 py-6 rounded-[2.3rem] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">
                Live BTC Price (EUR)
              </h3>
              <p className="text-4xl font-mono font-black text-blue-500 tracking-tighter">
                {btcPrice ? `€${btcPrice.toLocaleString()}` : "SYNCING..."}
              </p>
            </div>
          </div>
        </section>

        {/* Nodes */}
        <section className="space-y-12">
          <div className="text-center">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tight">Yield Protocol Nodes</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Select your deployment tier</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {nodes.map((node) => (
              <div
                key={node.name}
                className="group bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] text-center hover:bg-slate-900/60 hover:border-blue-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <h4 className="font-black text-white uppercase italic tracking-tighter text-lg">{node.name}</h4>
                  <p className="text-white font-mono font-bold text-sm">
                    €{node.min.toLocaleString()} – {node.max === Infinity ? "∞" : `€${node.max.toLocaleString()}`}
                  </p>
                  <div className="py-4 px-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-500 font-black text-xl tracking-tighter">{node.rate}</p>
                    <p className="text-emerald-500/60 text-[8px] font-black uppercase tracking-widest">Monthly Target</p>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinNode(node)}
                  className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  Invest Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="space-y-12">
          <div className="text-center">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tight">Global Trust Index</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Verified Deployment Feedback</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-blue-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center font-black text-blue-400 text-xs">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm italic uppercase">{review.name} {review.flag}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{review.country}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed italic">"{review.text}"</p>
                <div className="flex gap-1 text-blue-500">
                  {[...Array(5)].map((_, i) => <CheckCircle2 key={i} size={12} fill="currentColor" />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Expansion */}
        <section className="py-20 border-y border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                <Globe size={12} /> Global Footprint
              </div>
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-tight">
                Expanding the <br /><span className="text-blue-500">Trustra Network</span>
              </h3>
              <p className="text-slate-500 font-medium text-lg">
                To meet institutional demand, Trustra is establishing physical regulatory hubs across European and Asian sectors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                  <p className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">European Division</p>
                  <p className="text-white font-bold italic">Zürich, Switzerland</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                  <p className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">Asian Hub</p>
                  <p className="text-white font-bold italic">Singapore</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-600/5 rounded-[3rem] p-8 border border-blue-500/10 relative overflow-hidden group">
              <ShieldCheck className="absolute -right-10 -bottom-10 h-64 w-64 text-blue-500/5" />
              <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Regulatory-Grade Verification</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                To comply with 2026 Asset Security Directives, KYC is mandatory for all withdrawals and higher-tier deployments.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <span>ISO 27001</span>
                <span>GDPR COMPLIANT</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#020408] border-t border-white/5 px-6 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Trustra</h1>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div className="space-y-3">
                  <p className="text-red-500 font-black uppercase italic text-[10px] tracking-widest">Risk & Automation Protocol</p>
                  <p className="text-gray-500 text-[10px] leading-relaxed">
                    Trustra utilizes an <span className="text-white">Audit-Certified Automated Trading System</span> designed to mitigate market exposure. High-frequency model, capital loss mitigation [1.1].
                  </p>
                  <p className="text-gray-600 text-[9px] leading-relaxed italic">
                    Digital asset management involves market volatility. Automated preservation protocols help mitigate, but do not eliminate, inherent risk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-white font-black text-xs uppercase tracking-widest">Global HQ</h5>
            <ul className="space-y-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> USA Operations Center</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /> <a href="mailto:www.infocare@gmail.com" className="hover:text-blue-500 transition-colors">www.infocare@gmail.com</a></li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> <a href="tel:+18782241625" className="hover:text-blue-500 transition-colors">+1 (878) 224-1625</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-white font-black text-xs uppercase tracking-widest">Network Compliance</h5>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[9px] text-slate-500 leading-tight italic">Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
