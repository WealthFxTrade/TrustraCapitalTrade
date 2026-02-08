import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, Zap, Star, Mail, Phone, MapPin, ChevronRight, ShieldCheck 
} from 'lucide-react';

// Consolidated Data for 2026 Rio Series - Fixed to EUR
const RIO_PLANS = [
  { id: 1, name: "Rio Starter", range: "€100 – €999", roi: "6% – 9%" },
  { id: 2, name: "Rio Basic", range: "€1,000 – €4,999", roi: "9% – 12%" },
  { id: 3, name: "Rio Standard", range: "€5,000 – €14,999", roi: "12% – 16%" },
  { id: 4, name: "Rio Advanced", range: "€15,000 – €49,999", roi: "16% – 20%" },
  { id: 5, name: "Rio Elite", range: "€50,000+", roi: "20% – 25%" },
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
        // Fetching EUR price specifically for 2026 market parity
        const res = await axios.get('https://api.coingecko.com');
        if (isMounted && res.data.bitcoin.eur) {
          setBtcPrice(res.data.bitcoin.eur);
        }
      } catch (err) {
        console.error("Price sync error", err);
        if (isMounted) setBtcPrice("Sync Error");
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
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
            <Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">Register</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-48 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Invest in Bitcoin with Confidence</h1>
          <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
            Since 2016, we help investors grow capital via secure automated trading.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/register" className="bg-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500 transition shadow-xl">Get Started</Link>
            <a href="#plans" className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition">View Plans</a>
          </div>

          <div className="inline-block bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-2">Live Market Price (EUR)</p>
            <div className="text-3xl md:text-5xl font-mono font-black">{formatEuro(btcPrice)}</div>
            <p className="text-[10px] text-slate-500 mt-2">Real-time data provided by CoinGecko</p>
          </div>
        </div>
      </header>

      {/* PLANS SECTION */}
      <section id="plans" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {RIO_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all group">
              <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4">{plan.name}</h3>
              <p className="text-2xl font-black mb-2">{plan.range}</p>
              <p className="text-sm text-slate-500 mb-8">{plan.roi} Monthly</p>
              <Link to="/register" className="flex items-center justify-between w-full p-4 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-blue-600 transition-colors">
                Join <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-white/5 border-y border-white/5 overflow-hidden">
        <div className="flex animate-marquee gap-8 whitespace-nowrap">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="inline-block bg-black/40 p-8 rounded-3xl border border-white/5 min-w-[350px]">
              <div className="flex gap-1 text-blue-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-slate-300 text-sm italic mb-6">"{rev.text}"</p>
              <p className="font-bold text-xs uppercase tracking-widest">{rev.name}, {rev.country}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-black text-white uppercase italic">Trustra</span>
            </div>
            <p>Leading secure, automated digital asset management since 2016.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Contact Node</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-center gap-3"><Mail size={16} className="text-blue-500" /> Managementcare2@gmail.com</p>
              <p className="flex items-center gap-3"><Phone size={16} className="text-blue-500" /> +1 (878) 224-1625</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Global HQ</h4>
            <p className="text-sm text-slate-400 flex items-start gap-3">
              <MapPin size={16} className="text-blue-500 shrink-0" />
              One World Trade Center, Suite 85, New York, NY
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">© 2016–2026 TrustraCapitalTrade. All Rights Reserved.</p>
          <p className="text-[9px] text-slate-800 mt-4 max-w-2xl mx-auto italic uppercase">Risk Warning: Trading cryptocurrencies involves significant risk. Invest only what you can afford to lose.</p>
        </div>
      </footer>
    </div>
  );
}

