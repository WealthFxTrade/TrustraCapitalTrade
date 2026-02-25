import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Activity,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  Copy,
} from 'lucide-react';
import QRCode from 'qrcode.react';
import api from '../api/api';
import { toast } from 'react-hot-toast';

const PLAN_DATA = [
  { name: 'Rio Starter', roi: '6–9%', range: '€100 – €999', amount: 100, duration: 30 },
  { name: 'Rio Basic', roi: '9–12%', range: '€1,000 – €4,999', amount: 1000, duration: 30 },
  { name: 'Rio Standard', roi: '12–16%', range: '€5,000 – €14,999', amount: 5000, duration: 30 },
  { name: 'Rio Advanced', roi: '16–20%', range: '€15,000 – €49,999', amount: 15000, duration: 30 },
  { name: 'Rio Elite', roi: '20–25%', range: '€50,000 – ∞', amount: 50000, duration: 30 },
];

const REVIEWS = [
  { initial: 'M', name: 'Marco Vieri', flag: '🇮🇹', location: 'Milan, Italy', text: "The Rio Elite node has maintained a consistent 22% ROI. The automated risk management is unlike anything I've seen in Milan." },
  { initial: 'Y', name: 'Yuki Tanaka', flag: '🇯🇵', location: 'Tokyo, Japan', text: "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless for Tokyo investors." },
  { initial: 'S', name: 'Sebastian Müller', flag: '🇩🇪', location: 'Berlin, Germany', text: "The automated node handled market volatility perfectly. Zero manual intervention needed. True hands-off wealth management." },
];

const LandingPage = () => {
  const [btcPrice, setBtcPrice] = useState(58167.42);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userBTCAddress, setUserBTCAddress] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [planStates, setPlanStates] = useState(() =>
    PLAN_DATA.reduce((acc, plan) => {
      acc[plan.name] = { liveProfit: 0, isCompleted: false, remainingMs: plan.duration * 24 * 60 * 60 * 1000 };
      return acc;
    }, {})
  );

  // Restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Fetch BTC price every 30s
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get('/market/btc-price');
        if (res.data?.success) setBtcPrice(res.data.price);
      } catch {
        console.warn('Unable to fetch BTC price.');
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update live profit and countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPlanStates(prev => {
        const updated = { ...prev };
        PLAN_DATA.forEach(plan => {
          const dailyRoi = Number(plan.roi.split('–')[0]);
          const totalProfit = plan.amount * (dailyRoi / 100) * plan.duration;
          const newRemaining = Math.max(prev[plan.name].remainingMs - 1000, 0);
          updated[plan.name] = {
            liveProfit: totalProfit * (1 - newRemaining / (plan.duration * 24 * 60 * 60 * 1000)),
            isCompleted: newRemaining <= 0,
            remainingMs: newRemaining
          };
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const openBTCModal = async (plan) => {
    if (!user) {
      toast('You must log in to invest.');
      setAuthModalOpen(true);
      setIsRegister(false);
      return;
    }
    try {
      const res = await api.get(`/api/deposit-address?plan=${plan.name}`);
      setUserBTCAddress(res.data.address);
      setSelectedPlan(plan);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Unable to generate deposit address.');
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userBTCAddress);
    toast.success('Bitcoin address copied!');
  };

  const handleAuth = async () => {
    if (!email || !password) return toast.error('Email and password required.');
    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password });
        toast.success('Registration successful! Please log in.');
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(`Welcome, ${res.data.user.email}!`);
        setAuthModalOpen(false);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      if (err.response?.data?.message) toast.error(err.response.data.message);
      else toast.error('Network error. Please check your connection.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out.');
  };

  const formatTime = ms => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center font-black text-black shadow-lg shadow-yellow-500/20">T</div>
            <span className="text-xl font-bold tracking-tighter uppercase">
              Trustra <span className="text-white/20 font-light text-[10px] tracking-[0.3em] ml-2">Capital</span>
            </span>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-yellow-500 font-bold">{user.email}</span>
              <button onClick={logout} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 text-black font-bold">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setAuthModalOpen(true); setIsRegister(false); }} className="px-4 py-2 bg-yellow-600 rounded-lg font-bold text-black hover:bg-yellow-500">Sign In</button>
              <button onClick={() => { setAuthModalOpen(true); setIsRegister(true); }} className="px-4 py-2 bg-white/5 rounded-lg font-bold text-white hover:bg-white/10">Create Account</button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-48 pb-20 px-6 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <ShieldCheck className="w-4 h-4 text-yellow-500" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Network Compliance v8.4.1</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-[1.1]">
          Invest Smart.<br />
          <span className="text-white/30 font-light">Trade Confident.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-12 leading-relaxed">
          Access proprietary automated trading nodes with real-time profit tracking. Delivering precision-grade capital management since 2016.
        </p>
      </section>

      {/* LIVE BTC PRICE */}
      <div className="flex justify-center items-center gap-6 mb-16">
        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 backdrop-blur-sm">
          <div className="text-left">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live BTC Price</div>
            <div className="text-yellow-500 font-mono font-bold">€{btcPrice.toLocaleString()}</div>
          </div>
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
        </div>
      </div>

      {/* PLAN NODES */}
      <section id="nodes" className="py-12 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4">
        {PLAN_DATA.map(plan => (
          <div key={plan.name} className="bg-[#0a0f1e] border border-white/5 p-8 rounded-3xl group hover:border-yellow-500/30 transition-all">
            <h3 className="text-white/40 text-[10px] font-bold uppercase mb-4 tracking-widest">{plan.name}</h3>
            <div className="text-3xl font-bold mb-1 group-hover:text-yellow-500 transition-colors">{plan.roi}</div>
            <div className="text-[9px] text-green-500 font-bold mb-6 italic uppercase">Monthly Target</div>
            <div className="text-[10px] text-white/30 mb-2 border-t border-white/5 pt-2">Entry: {plan.range}</div>
            <div className={`text-[10px] font-black mb-1 ${planStates[plan.name].isCompleted ? 'text-emerald-400' : 'text-yellow-500 animate-pulse'}`}>
              {planStates[plan.name].isCompleted ? 'Completed' : 'Node Running'}
            </div>
            <div className="text-[10px] text-white/50 mb-2">
              Time Left: {formatTime(planStates[plan.name].remainingMs)}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mb-4">
              Accrued: €{planStates[plan.name].liveProfit.toFixed(2)}
            </div>
            <button onClick={() => openBTCModal(plan)} className="block w-full text-center py-3 bg-yellow-600 rounded-xl text-[10px] font-black text-black uppercase tracking-tighter hover:bg-yellow-500 transition-all">
              Invest Now
            </button>
          </div>
        ))}
      </section>

      {/* REVIEWS */}
      <section className="py-24 px-6">
        <h2 className="text-center text-[10px] font-bold tracking-[0.5em] uppercase text-yellow-500 mb-20">Verified Deployment Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {REVIEWS.map((r, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#0a0f1e] border border-white/5 relative group hover:bg-white/[0.03] transition-all">
              <div className="absolute top-6 right-6 flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                <CheckCircle size={10} /> Verified
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center font-bold text-black text-sm">{r.initial}</div>
                <div>
                  <div className="text-sm font-bold">{r.name} {r.flag}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">{r.location}</div>
                </div>
              </div>
              <p className="text-white/50 text-sm italic leading-relaxed">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* GLOBAL EXPANSION */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <h2 className="text-center text-2xl font-bold mb-6">Expanding the Trustra Network</h2>
        <p className="text-center max-w-2xl mx-auto text-white/50 mb-12">
          To meet institutional demand, Trustra is establishing physical regulatory hubs across European and Asian sectors. Zurich and Singapore hubs are now active for private wealth management.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-7xl mx-auto">
          <div>
            <h3 className="text-lg font-bold mb-2">Zürich, CH</h3>
            <p className="text-white/50 text-sm">European Division</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Singapore, SG</h3>
            <p className="text-white/50 text-sm">Asian Hub</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/40 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center font-black text-black">T</div>
              <span className="font-bold tracking-widest">TRUSTRA CAPITAL</span>
            </div>
            <div className="space-y-4 text-white/40 text-[11px] uppercase tracking-widest leading-loose">
              <div className="flex items-start gap-3"><MapPin size={14} className="text-yellow-600 mt-1" />Brandschenkestrasse 90, 8002 Zürich, Switzerland</div>
              <div className="flex items-start gap-3"><MapPin size={14} className="text-yellow-600 mt-1" />1201 Orange St, Wilmington, DE 19801, USA</div>
              <div className="flex items-start gap-3"><Mail size={14} className="text-yellow-600 mt-1" />www.infocare@gmail.com</div>
              <div className="flex items-start gap-3"><Phone size={14} className="text-yellow-600 mt-1" />+1 (878) 224-1625</div>
              <div className="flex items-start gap-3 text-[9px]">ISO 27001 & GDPR Compliant</div>
            </div>
          </div>
          <div className="text-[10px] text-white/40 italic text-center md:text-left leading-relaxed border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
            <strong>Risk & Automation Protocol:</strong> Trustra utilizes an Audit-Certified Automated Trading System designed to mitigate market exposure. High-frequency model, capital loss mitigation [1.1]. Digital asset management involves market volatility. Automated preservation protocols help mitigate risk, but do not eliminate inherent market risk. Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
