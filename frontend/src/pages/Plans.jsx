// src/pages/Plans.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// Using the specialized EUR component for 2026 consistency
import BtcPriceEUR from '@/components/BtcPriceEUR'; 

const plans = [
  {
    name: 'Rio Starter',
    min: 100,
    max: 999,
    roiDaily: 0.25, // Adjusted to match your cron job (~7.5% mo)
    duration: 30,
    desc: 'Automated entry-level trading with daily Euro credits.',
    color: 'from-cyan-600 to-cyan-400',
  },
  {
    name: 'Rio Basic',
    min: 1000,
    max: 4999,
    roiDaily: 0.35, // ~10.5% Monthly
    duration: 45,
    desc: 'Balanced growth for mid-tier capital allocation.',
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: 'Rio Standard',
    min: 5000,
    max: 14999,
    roiDaily: 0.46, // ~14% Monthly
    duration: 60,
    desc: 'Institutional-grade ROI for serious portfolio growth.',
    color: 'from-purple-600 to-purple-400',
  },
  {
    name: 'Rio Advanced',
    min: 15000,
    max: 49999,
    roiDaily: 0.60, // ~18% Monthly
    duration: 90,
    desc: 'Premium yields with prioritized 2026 audit security.',
    color: 'from-amber-600 to-amber-400',
  },
  {
    name: 'Rio Elite',
    min: 50000,
    max: Infinity,
    roiDaily: 0.75, // ~22.5% Monthly
    duration: 120,
    desc: 'Maximum performance tier for high-net-worth investors.',
    color: 'from-rose-600 to-rose-400',
  },
];

export default function Plans() {
  return (
    <div className="min-h-screen bg-[#05070a] text-gray-100 selection:bg-cyan-500/30">
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 text-center">
        <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter italic uppercase bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          Trustra Capital Trade
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto font-medium">
          Operating Securely Since 2016 • High-Yield Digital Asset Management
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition transform hover:-translate-y-1 active:scale-95"
          >
            Open Investment Account
          </Link>
          <Link
            to="/login"
            className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black py-5 px-14 rounded-2xl text-xs uppercase tracking-[0.2em] transition"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* BTC Price Section (Standardized to EUR for 2026) */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Live Market Feed</p>
          <h2 className="text-3xl font-bold mb-4 text-white">Current Bitcoin Valuation</h2>
          <div className="text-5xl md:text-7xl font-mono font-black text-white flex items-center justify-center gap-4">
             <span className="text-cyan-400">€</span><BtcPriceEUR />
          </div>
          <p className="text-gray-500 text-[10px] mt-6 font-bold uppercase tracking-widest italic">Verified Real-Time Data • CoinGecko Service</p>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Rio Series Schemas
          </h2>
          <div className="h-1 w-24 bg-cyan-500 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gradient-to-br ${plan.color} bg-opacity-5 border border-white/10 rounded-[2.5rem] p-8 hover:border-white/30 transition-all duration-500 flex flex-col group relative overflow-hidden`}
            >
              {/* Decorative background element */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
              
              <h3 className="text-2xl font-black mb-2 text-white italic tracking-tight">{plan.name}</h3>
              <p className="text-gray-200/60 text-xs font-bold leading-relaxed mb-6 h-12 uppercase tracking-tighter">
                {plan.desc}
              </p>
              
              <div className="mb-8">
                <p className="text-5xl font-black text-white tracking-tighter">
                  {plan.roiDaily}%
                </p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-1 italic">Daily Profit Drop</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Min Deposit</span>
                  <span className="font-mono font-bold text-white text-lg">€{plan.min.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Max Limit</span>
                  <span className="font-mono font-bold text-white text-lg">
                    {plan.max === Infinity ? '∞' : `€${plan.max.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Term</span>
                  <span className="font-mono font-bold text-cyan-400 text-lg">{plan.duration} Days</span>
                </div>
              </div>

              <Link
                to="/signup"
                className="mt-auto bg-white text-black font-black py-4 px-8 rounded-2xl text-center text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-400 transition shadow-xl"
              >
                Invest Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 2026 Compliance Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 italic">© 2016-2026 Trustra Capital Trade Global Inc.</p>
        <p className="max-w-3xl mx-auto px-6 text-[9px] leading-relaxed opacity-50 uppercase font-medium">
          Digital assets trading involves significant risk of loss. Trustra operates in compliance with 2026 Asset Recovery Protocols. Past performance is not a guarantee of future EUR ROI.
        </p>
      </footer>
    </div>
  );
}

