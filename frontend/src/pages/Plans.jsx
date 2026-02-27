import React from 'react';
import { Link } from 'react-router-dom';
import BtcPriceEUR from '../components/wallet/BtcPrice.jsx';
import { AlertTriangle, Info } from 'lucide-react';

const plans = [
  { name: 'Starter', min: 100, max: 999, desc: 'Entry-level investment option' },
  { name: 'Basic', min: 1000, max: 4999, desc: 'Balanced investment range' },
  { name: 'Standard', min: 5000, max: 14999, desc: 'Standard investment tier' },
  { name: 'Advanced', min: 15000, max: 49999, desc: 'Advanced investment option' },
  { name: 'Elite', min: 50000, max: Infinity, desc: 'High-tier investment plan' },
];

export default function Plans() {
  return (
    <div className="min-h-screen bg-[#05070a] text-gray-100 selection:bg-cyan-500/30">
      {/* Warning Banner */}
      <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 m-6 flex items-start gap-4 max-w-5xl mx-auto">
        <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={28} />
        <div>
          <h4 className="font-bold text-red-300 mb-2">High Risk Warning</h4>
          <p className="text-red-200 text-sm leading-relaxed">
            Cryptocurrency investments carry significant risk of loss. Returns are not guaranteed and can be negative. Only invest what you can afford to lose. This page is for informational purposes only.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic uppercase">
          Investment Plans
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-4xl mx-auto font-medium">
          Explore available investment options — all subject to market conditions.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition transform hover:-translate-y-1 active:scale-95 text-center"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black py-5 px-14 rounded-2xl text-xs uppercase tracking-[0.2em] transition text-center"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* BTC Price Section */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Live Market Data</p>
          <h2 className="text-3xl font-bold mb-4 text-white">Current Bitcoin Price</h2>
          <div className="text-5xl md:text-7xl font-mono font-black text-white flex items-center justify-center gap-4">
            <span className="text-cyan-400">€</span>
            <BtcPriceEUR />
          </div>
          <p className="text-gray-500 text-[10px] mt-6 font-bold uppercase tracking-widest italic">
            Real-time data • Market conditions apply
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Available Plans
          </h2>
          <div className="h-1 w-24 bg-cyan-500 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gradient-to-br ${plan.color} bg-opacity-5 border border-white/10 rounded-[2.5rem] p-8 hover:border-white/30 transition-all duration-500 flex flex-col group relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>

              <h3 className="text-2xl font-black mb-4 text-white italic tracking-tight">{plan.name}</h3>
              <p className="text-gray-200/60 text-xs font-bold leading-relaxed mb-8 h-12">
                {plan.desc}
              </p>

              <div className="space-y-4 mb-10 flex-1">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Minimum</span>
                  <span className="font-mono font-bold text-white text-lg">€{plan.min.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Maximum</span>
                  <span className="font-mono font-bold text-white text-lg">
                    {plan.max === Infinity ? 'No limit' : `€${plan.max.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <Link
                to="/register"
                className="mt-auto bg-white text-black font-black py-4 px-8 rounded-2xl text-center text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-400 transition shadow-xl"
              >
                Explore This Plan
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 italic">
          © 2026 Investment Platform
        </p>
        <p className="max-w-3xl mx-auto px-6 text-[9px] leading-relaxed opacity-50 uppercase font-medium">
          Investments involve risk of loss. Past performance is not indicative of future results. Verify all details before proceeding.
        </p>
      </footer>
    </div>
  );
}
