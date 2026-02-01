import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBtcPrice } from '../api';
import { ROI_PLANS, REVIEWS } from '../constants/data';

export default function Home() {
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        const res = await getBtcPrice();
        // Robust check for Binance API ({price: "..."}) or CoinGecko ({bitcoin: {usd: ...}})
        const rawPrice = res.data.price || (res.data.bitcoin && res.data.bitcoin.usd);
        if (isMounted && rawPrice) {
          setBtcPrice(parseFloat(rawPrice));
        }
      } catch (err) {
        if (isMounted) setBtcPrice("Service Offline");
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // 30s live refresh
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const formatCurrency = (val) => {
    if (val === null) return "Syncing...";
    if (typeof val === 'string') return val;
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen overflow-x-hidden">
      {/* HERO SECTION: Mobile-First Scaling */}
      <section className="py-16 md:py-24 px-4 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight px-2">
          Trustra Capital Trade
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto px-4">
          Secure High-Yield Cryptocurrency Investments since 2016.
        </p>
        <div className="bg-slate-800 inline-flex items-center px-5 py-2 rounded-full border border-slate-700 shadow-xl scale-90 md:scale-100">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
          <span className="text-sm md:text-base">Live BTC:</span>
          <span className="text-green-400 font-mono ml-2 font-bold text-sm md:text-base animate-price-sync">
            ${formatCurrency(btcPrice)}
          </span>
        </div>
      </section>

      {/* INVESTMENT TIERS: 1 col on mobile, 2 on tablet, 5 on desktop */}
      <section className="py-12 md:py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Investment Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {ROI_PLANS.slice(0, 5).map((plan) => (
            <div key={plan.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-blue-500 transition-all shadow-lg hover:-translate-y-1">
              <div>
                <h3 className="text-blue-500 font-bold text-lg">{plan.name}</h3>
                <p className="text-3xl font-bold my-3">{plan.roi}% <span className="text-sm text-slate-500 font-normal">ROI</span></p>
                <div className="text-sm text-slate-400 mb-6 space-y-1">
                  <p>Min: ${plan.min.toLocaleString()}</p>
                  <p>Term: {plan.days} Days</p>
                </div>
              </div>
              <Link to="/signup" className="block text-center bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 active:scale-95 transition">
                Start Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS SECTION: Native swipe on mobile, Grid on large screens */}
      <section className="py-12 md:py-20 bg-slate-900/40 border-y border-slate-900">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Global Reviews</h2>
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 overflow-x-auto md:overflow-visible gap-6 px-6 max-w-7xl mx-auto pb-6 no-scrollbar">
          {REVIEWS.slice(0, 5).map((rev) => (
            <div key={rev.id} className="min-w-[280px] md:min-w-0 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                  {rev.name.charAt(0)}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="font-bold text-sm truncate">{rev.name}</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">{rev.country}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs italic leading-relaxed line-clamp-4">"{rev.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* REGULATORY FOOTER [2026 Compliance] */}
      <footer className="py-12 px-6 border-t border-slate-900 text-center">
        <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed max-w-2xl mx-auto">
          REGULATORY DISCLOSURE: Cryptocurrency trading involves significant risk. Trustra Capital Trade operates in compliance with 2026 Digital Asset Directives. Past performance is not indicative of future results.
        </p>
        <p className="text-slate-600 text-[9px] mt-4 uppercase tracking-widest">&copy; 2016-2026 Trustra Capital Trade</p>
      </footer>
    </div>
  );
}

