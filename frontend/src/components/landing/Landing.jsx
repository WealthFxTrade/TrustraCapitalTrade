import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, ShieldCheck, AlertTriangle, ArrowRight, 
  Star, Loader2, Menu, X 
} from 'lucide-react';
import RoiCalculator from './RoiCalculator';

// ── CONSTANTS (Moved outside to prevent re-renders) ──
const REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", text: "The London node execution is flawless. My Rio Elite protocol has maintained steady yields." },
  { name: "Sven Lindholm", country: "Sweden", text: "Institutional grade precision. The automated protocols saved my capital during the flash crash." },
  { name: "Elena Rossi", country: "Italy", text: "Finally, a terminal that respects European markets. High-speed and daily payouts." },
  { name: "Jameson Vance", country: "USA", text: "Operating from the New York hub, the latency is practically zero. Trustra is the 2026 benchmark." },
  { name: "Hiroshi Tanaka", country: "Japan", text: "The quantum protocols are legitimate. I've switched my entire portfolio to the Rio nodes." }
];

const PLANS = [
  { id: 'starter', name: 'Rio Starter', yield: '6–9%', min: '100', color: 'from-blue-500/20' },
  { id: 'basic', name: 'Rio Basic', yield: '9–12%', min: '1.000', color: 'from-emerald-500/20' },
  { id: 'standard', name: 'Rio Standard', yield: '12–16%', min: '5.000', color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', yield: '16–20%', min: '15.000', color: 'from-orange-500/20' },
  { id: 'elite', name: 'Rio Elite', yield: '20–25%', min: '50.000', color: 'from-yellow-500/20' }
];

export default function Landing() {
  const navigate = useNavigate();
  const plansRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ── CRYPTO DATA STATE ──
  const [cryptoData, setCryptoData] = useState({
    btc: { price: '...', change: 0 },
    eth: { price: '...', change: 0 }
  });
  const [cryptoLoading, setCryptoLoading] = useState(true);

  // ── FETCH PRICES (With 5s Timeout) ──
  useEffect(() => {
    const fetchPrices = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Timeout

      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur&include_24hr_change=true',
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('API Rate Limit');
        const data = await res.json();

        setCryptoData({
          btc: {
            price: data.bitcoin.eur.toLocaleString('de-DE'),
            change: data.bitcoin.eur_24h_change
          },
          eth: {
            price: data.ethereum.eur.toLocaleString('de-DE'),
            change: data.ethereum.eur_24h_change
          }
        });
      } catch (err) {
        console.warn('Price Feed Delayed:', err.message);
      } finally {
        setCryptoLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── SCROLL OBSERVER ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderChange = (val) => (
    <span className={`text-[9px] font-bold ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {val >= 0 ? '▲' : '▼'} {Math.abs(val).toFixed(2)}%
    </span>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-yellow-500/30 overflow-x-hidden relative">
      
      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 border-b ${scrolled ? 'bg-[#020408]/90 backdrop-blur-2xl py-4 border-white/10' : 'bg-transparent py-6 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Zap size={22} className="text-yellow-500 fill-current" />
            <span className="text-xl font-black tracking-tighter italic uppercase">TRUSTRA</span>
          </div>

          {/* Live Ticker */}
          <div className="hidden lg:flex items-center gap-6 bg-white/5 px-5 py-2 rounded-2xl border border-white/10">
            <PriceTicker label="BTC/EUR" data={cryptoData.btc} loading={cryptoLoading} renderChange={renderChange} />
            <PriceTicker label="ETH/EUR" data={cryptoData.eth} loading={cryptoLoading} renderChange={renderChange} />
          </div>

          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-xl">Start Protocol</button>
          </div>
          
          <button className="md:hidden p-2 text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-48 pb-20 md:pt-64 md:pb-32 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={14} className="text-yellow-500" /> SECURED BY QUANTUM PROTOCOLS
          </div>
          <h1 className="text-6xl md:text-[100px] font-black tracking-tight leading-[0.9] uppercase">
            Wealth <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">Redefined</span> <br />
            <span className="text-yellow-500 italic">Automated.</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-bold leading-relaxed uppercase tracking-tight">
            Institutional-grade algorithmic trading. Precision execution across global hubs with 24/7 monitoring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-yellow-500 text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-2xl">
              Start Earning <ArrowRight size={18} />
            </button>
            <button onClick={() => plansRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white/5 border border-white/10 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all">
              View Plans
            </button>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section className="px-4 mb-24 max-w-6xl mx-auto relative z-20">
        <RoiCalculator />
      </section>

      {/* ── PLANS ── */}
      <div ref={plansRef}>
        <PlansSection navigate={navigate} />
      </div>

      {/* ── REVIEWS ── */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] mb-16 italic">Global Pulse</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {REVIEWS.map((rev, i) => (
              <ReviewCard key={i} rev={rev} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

// ── SUB-COMPONENTS (Clean code separation) ──

const PriceTicker = ({ label, data, loading, renderChange }) => (
  <div className="flex items-center gap-3 pr-4 last:border-0 last:pr-0 border-r border-white/10">
    <span className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em]">{label}</span>
    {loading ? (
      <Loader2 className="animate-spin text-yellow-500" size={14} />
    ) : (
      <>
        <span className="text-[11px] font-mono font-black text-yellow-500 italic">€{data.price}</span>
        {renderChange(data.change)}
      </>
    )}
  </div>
);

const PlansSection = ({ navigate }) => (
  <section className="py-24 px-5 bg-[#020408]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
          Select Your <span className="text-yellow-500">Node Protocol</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">Choose a liquidity tier to begin automated yield execution across our global hubs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`relative group overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b ${plan.color} to-transparent p-6 transition-all hover:border-white/20 hover:-translate-y-1`}>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{plan.name}</h3>
              <div className="text-3xl font-black italic mb-6 text-yellow-500">{plan.yield}</div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-40">Min Deposit</span>
                  <span className="font-bold">€{plan.min}</span>
                </div>
              </div>
              <button onClick={() => navigate('/register', { state: { plan: plan.id } })} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Activate Node
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ReviewCard = ({ rev }) => (
  <div className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] hover:border-yellow-500/20 transition-all">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, s) => <Star key={s} size={10} className="fill-yellow-500 text-yellow-500" />)}
    </div>
    <p className="text-[11px] text-gray-400 leading-relaxed italic font-medium mb-6">"{rev.text}"</p>
    <div className="pt-4 border-t border-white/5">
      <p className="text-[10px] font-black text-white uppercase tracking-tighter">{rev.name}</p>
      <p className="text-[9px] font-bold text-gray-600 uppercase italic">{rev.country}</p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/5 bg-black">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
      <div className="space-y-6">
        <h3 className="text-lg font-black italic uppercase text-yellow-500">Infrastructure</h3>
        <p className="text-[10px] text-gray-500 uppercase font-bold leading-relaxed tracking-wider">USA • Frankfurt • London • Tokyo Hubs.</p>
      </div>
      <div className="space-y-6">
        <h3 className="text-lg font-black italic uppercase text-yellow-500">Contact Protocol</h3>
        <p className="text-xs text-gray-300 font-mono">www.infocare@gmail.com</p>
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-[10px] font-black uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
          Systems Operational
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 p-8 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem]">
      <div className="flex items-center gap-2 text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
        <AlertTriangle size={16} /> Risk Disclosure
      </div>
      <p className="text-[9px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest mt-4">
        Algorithmic trading involves significant risk. 2026 performance is monitored but not guaranteed.
      </p>
    </div>
  </footer>
);

