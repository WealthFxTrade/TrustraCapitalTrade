import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, Zap, Star, Mail, Phone, MapPin, ChevronRight, ShieldCheck 
} from 'lucide-react';
import { getBtcPrice } from '../api';

// Consolidated Data for 2026 Rio Series
const RIO_PLANS = [
  { id: 1, name: "Rio Starter", range: "€100–€999", roi: "6%–9%" },
  { id: 2, name: "Rio Basic", range: "€1,000–€4,999", roi: "9%–12%" },
  { id: 3, name: "Rio Standard", range: "€5,000–€14,999", roi: "12%–16%" },
  { id: 4, name: "Rio Advanced", range: "€15,000–€49,999", roi: "16%–20%" },
  { id: 5, name: "Rio Elite", range: "€50,000+", roi: "20%–25%" },
];

const REVIEWS = [
  { id: 1, name: "James K.", country: "USA", text: "Fast withdrawals and clear profit tracking. Best platform I've used." },
  { id: 2, name: "Liam O.", country: "UK", text: "Reliable platform with professional support. Highly recommended." },
  { id: 3, name: "Daniel M.", country: "Germany", text: "Consistent performance and secure system. Very satisfied." },
  { id: 4, name: "Marco R.", country: "Italy", text: "Very transparent investment process. Trustworthy." },
  { id: 5, name: "Kenji T.", country: "Japan", text: "Excellent experience for long-term investing. Great returns." },
];

export default function Home() {
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        // Attempt specialized API utility targeting EUR
        const res = await getBtcPrice();
        const rawPrice = res.data.eur || (res.data.bitcoin && res.data.bitcoin.eur);
        if (isMounted && rawPrice) setBtcPrice(parseFloat(rawPrice));
      } catch (err) {
        // Fallback: Direct CoinGecko EUR Endpoint for 2026 market parity
        try {
          const res = await axios.get('https://api.coingecko.com');
          if (isMounted) setBtcPrice(res.data.bitcoin.eur);
        } catch (innerErr) {
          if (isMounted) setBtcPrice("Service Offline");
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); 
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const formatEuro = (val) => {
    if (val === null) return "Syncing...";
    if (typeof val === 'string') return val;
    return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="bg-[#05070a] text-white font-sans selection:bg-blue-500/30 min-h-screen overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#05070a]/90 backdrop-blur-md border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-blue-500" />
            <span className="text-xl font-black tracking-tighter italic uppercase">TrustraCapital</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">Register</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-48 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Invest in Bitcoin with Confidence</h1>
          <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
            Since 2016, we help investors grow capital via secure automated trading.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/register" className="bg-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500 transition shadow-xl">Get Started</Link>
            <a href="#plans" className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition">View Plans</a>
          </div>

          <div className="inline-block bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">Live Market Price (EUR)</p>
            <div className="text-3xl md:text-5xl font-mono font-black">1 BTC = {formatEuro(btcPrice)}</div>
            <p className="text-[10px] text-slate-500 mt-2">Real-time data provided by CoinGecko</p>
          </div>
        </div>
      </header>

      {/* RIO SERIES PLANS */}
      <section id="plans" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Rio Series Investment Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {RIO_PLANS.map((plan) => (
            <div key={plan.id} className="bg-[#0a0c10] p-8 rounded-3xl border border-white/5 hover:border-blue-500/50 transition group shadow-2xl">
              <Zap className="text-blue-500 w-6 h-6 mb-6" />
              <h3 className="text-white font-bold text-lg mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.range}</p>
              <p className="text-3xl font-black text-green-400 mb-8">{plan.roi} <span className="text-[10px] text-slate-500 block uppercase mt-1">Monthly ROI</span></p>
              <Link to="/register" className="block text-center bg-white/5 py-3 rounded-xl font-bold group-hover:bg-white group-hover:text-black transition">Select Plan</Link>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="bg-[#05070a] p-6 rounded-2xl border border-white/5">
              <div className="flex text-yellow-500 mb-4"><Star size={12} fill="currentColor" className="mr-1" />{[1,2,3,4].map(s => <Star key={s} size={12} fill="currentColor" className="mr-1" />)}</div>
              <p className="text-slate-400 text-sm italic mb-6 leading-relaxed">"{rev.text}"</p>
              <p className="font-bold text-white text-xs">{rev.name}, <span className="text-blue-500">{rev.country}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
          <Mail className="mx-auto text-blue-500 mb-4" size={32} />
          <h4 className="font-bold mb-1">Email Support</h4>
          <p className="text-slate-400 text-sm">Managementcare2@gmail.com</p>
        </div>
        <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
          <Phone className="mx-auto text-blue-500 mb-4" size={32} />
          <h4 className="font-bold mb-1">Phone Line</h4>
          <p className="text-slate-400 text-sm">+1 (878) 224-1625</p>
        </div>
        <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
          <MapPin className="mx-auto text-blue-500 mb-4" size={32} />
          <h4 className="font-bold mb-1">Global HQ</h4>
          <p className="text-slate-400 text-sm">One World Trade Center, Suite 85, New York, NY</p>
        </div>
      </section>

      {/* REGULATORY FOOTER [2026 Compliance] */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#030406]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="text-blue-500 w-5 h-5" />
            <span className="text-lg font-black italic uppercase">Trustra Capital Trade</span>
          </div>
          <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed max-w-2xl text-center mb-8">
            <strong>REGULATORY DISCLOSURE:</strong> Cryptocurrency trading involves significant risk. Trustra Capital Trade operates in compliance with 2026 Digital Asset Directives. Past performance is not indicative of future results. Invest responsibly and only what you can afford to lose.
          </p>
          <p className="text-slate-600 text-[9px] uppercase tracking-[0.3em]">&copy; 2016-2026 TrustraCapitalTrade. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

