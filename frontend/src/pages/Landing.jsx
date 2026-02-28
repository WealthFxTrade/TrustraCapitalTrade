// src/pages/Landing.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Globe, ArrowUpRight, Mail, 
  Phone, MapPin, Loader2, Zap, 
  ChevronRight, BarChart3, Lock
} from 'lucide-react';

const plans = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9%', entry: '€100 – €999', color: 'text-blue-400' },
  { id: 'basic', name: 'Rio Basic', roi: '9–12%', entry: '€1,000 – €4,999', color: 'text-emerald-400' },
  { id: 'standard', name: 'Rio Standard', roi: '12–16%', entry: '€5,000 – €14,999', color: 'text-yellow-500' },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20%', entry: '€15,000 – €49,999', color: 'text-orange-500' },
  { id: 'elite', name: 'Rio Elite', roi: '20–25%', entry: '€50,000 – ∞', color: 'text-red-500' },
];

const testimonials = [
  { name: 'Marco Vieri 🇮🇹', loc: 'Milan, Italy', text: "The Rio Elite node has maintained a consistent 22% ROI. The automated risk management is unlike anything I've seen in Milan." },
  { name: 'Yuki Tanaka 🇯🇵', loc: 'Tokyo, Japan', text: "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors." },
  { name: 'Sebastian Müller 🇩🇪', loc: 'Berlin, Germany', text: "The automated node handled market volatility perfectly. Zero manual intervention needed. True hands-off wealth management." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState(64231.50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      try {
        // Using CoinGecko for more reliable EUR pricing
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        const data = await res.json();
        setBtcPrice(data.bitcoin.eur);
      } catch (e) { 
        console.error("Price sync error - falling back to cache"); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#020408]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="bg-yellow-500 p-1.5 rounded-lg">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Trustra</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full animate-fade-in">
            <ShieldCheck size={14} className="text-yellow-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Network Compliance Protocol v8.4.1</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
            Capital <span className="text-yellow-500">Evolution.</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Proprietary automated trading nodes delivering precision-grade capital management. Secure your future with Trustra’s 2026 Directives.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button onClick={() => navigate('/register')} className="bg-yellow-500 hover:bg-white text-black font-black py-5 px-12 rounded-2xl transition-all shadow-2xl shadow-yellow-500/10 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group">
              Initialize Account <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Market Pulse Ticker */}
      <section className="py-16 bg-[#05070a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
              {loading && <Loader2 size={12} className="animate-spin" />} Live Market Feed • BTC/EUR
            </p>
          </div>
          <div className="text-6xl md:text-8xl font-black tracking-tighter italic">
            <span className="text-gray-800 mr-4 text-4xl md:text-6xl">€</span>
            {btcPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Growth Schemas</h2>
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-2 text-center md:text-left">Select your node tier</p>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-[9px] font-black uppercase tracking-widest">
            <Lock size={14} /> End-to-End Encrypted
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-[#0a0c10] border border-white/5 p-10 rounded-[2.5rem] hover:border-yellow-500/30 transition-all group flex flex-col justify-between h-full">
              <div>
                <p className={`font-black uppercase text-[10px] tracking-widest mb-6 ${plan.color}`}>{plan.name}</p>
                <div className="text-5xl font-black italic tracking-tighter mb-2">{plan.roi}</div>
                <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black mb-8 italic">Monthly Target Yield</p>
                <div className="h-px w-full bg-white/5 mb-8" />
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-10">Min. Entry: {plan.entry}</p>
              </div>
              <button 
                onClick={() => navigate('/register', { state: { plan: plan.id } })} 
                className="w-full py-4 bg-white/5 border border-white/10 hover:bg-yellow-500 hover:text-black transition-all rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
              >
                Execute
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-[#05070a] border-y border-white/5 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Global Node<br/><span className="text-yellow-500">Infrastructure.</span></h2>
              <p className="text-gray-400 text-lg leading-relaxed">Our proprietary algorithms analyze millions of data points across 14 international exchanges, executing precision trades with sub-millisecond latency.</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-3xl font-black italic text-white">99.9%</p>
                  <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mt-1">Uptime Guarantee</p>
                </div>
                <div>
                  <p className="text-3xl font-black italic text-white">256-bit</p>
                  <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mt-1">AES Encryption</p>
                </div>
              </div>
            </div>
            <div className="relative group">
               <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-700" />
               <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[3rem] relative z-10">
                  <BarChart3 className="text-yellow-500 mb-6" size={48} />
                  <p className="text-sm italic text-gray-300 leading-relaxed mb-8">"Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors."</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-full border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-black">Y</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Yuki Tanaka 🇯🇵</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Tokyo, Japan</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Footer */}
      <footer className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 border-b border-white/5 pb-20">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <Globe className="text-yellow-500" size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Global Hubs</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
                <div className="space-y-1"><p className="text-white">Zürich, CH</p><p>Euro Operations</p></div>
                <div className="space-y-1"><p className="text-white">Singapore, SG</p><p>Asia-Pacific Hub</p></div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700">Audit Center</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">Brandschenkestrasse 90,<br/>8002 Zürich, Switzerland</p>
            </div>
            <div className="space-y-6 text-right">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700">Support Terminal</h4>
              <a href="mailto:support@trustra.capital" className="block text-[11px] text-white hover:text-yellow-500 transition-colors uppercase font-black">support@trustra.capital</a>
              <p className="text-[11px] text-white font-mono">+1 (878) 224-1625</p>
            </div>
          </div>
          <div className="pt-10 text-center opacity-30">
            <p className="text-[8px] font-black uppercase tracking-[1em] text-gray-400">
              Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
