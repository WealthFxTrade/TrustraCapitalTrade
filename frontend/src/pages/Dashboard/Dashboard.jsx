import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Wallet, Zap, Activity, RefreshCw,
  Copy, Check, ShieldCheck, ArrowUpRight, Globe,
  Loader2, MessageSquareDot, LifeBuoy, ChevronRight, QrCode
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import VaultSection from './VaultSection'; // Ensure this file exists in the same folder

// ── COMPONENT: PROTOCOL STAT CARD ──
const ProtocolStat = ({ label, value, icon: Icon, color, suffix = "", prefix = "€" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-yellow-500/30 transition-all duration-500 overflow-hidden"
  >
    <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 ${color}`}>
      <Icon size={160} />
    </div>
    <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-4">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-4xl font-black italic tracking-tighter ${color}`}>
        {prefix}
        <CountUp end={value} decimals={2} duration={2} separator="." decimal="," />
        {suffix}
      </span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);
  const [unreadSupport, setUnreadSupport] = useState(false);

  // 1. 🛰️ NODE LATENCY TRACKER
  const checkNodeStatus = useCallback(async () => {
    const start = Date.now();
    try {
      await api.get('/auth/me');
      setLatency(Date.now() - start);
    } catch (err) {
      setLatency('OFFLINE');
    }
  }, []);

  // 2. 📊 DATA INITIALIZATION
  const fetchDashboardData = useCallback(async () => {
    try {
      await checkNodeStatus();
      const [profileRes, supportRes, historyRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/support/my-tickets').catch(() => ({ data: { tickets: [] } })),
        api.get('/user/yield-history').catch(() => ({ data: { success: false } }))
      ]);

      const userData = profileRes.data.user;
      setStats(userData);

      // Check for Admin Replies
      const hasUpdates = supportRes.data.tickets?.some(t =>
        t.status === 'in-progress' &&
        t.messages.length > 0 &&
        t.messages[t.messages.length - 1].sender !== userData._id
      );
      setUnreadSupport(hasUpdates);

      // Chart Data: Real History vs Mock Fallback
      if (historyRes.data.success && historyRes.data.history?.length > 0) {
        setChartData(historyRes.data.history);
      } else {
        const currentRoi = userData.balances?.ROI || 50;
        const mock = Array.from({ length: 7 }, (_, i) => ({
          day: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
          yield: Number((currentRoi * (0.7 + (i * 0.1))).toFixed(2))
        }));
        setChartData(mock);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      toast.error("Protocol Sync Interrupted.");
    } finally {
      setLoading(false);
    }
  }, [checkNodeStatus]);

  // 3. 🛰️ LIVE PROTOCOL SYNC (Socket.io)
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:10000', {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.emit('join_terminal', user._id);

    socket.on('balance_update', (data) => {
      toast.success(`Yield Realized: +€${data.addedAmount}`, {
        icon: '📈',
        style: { background: '#0a0c10', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)' }
      });
      setStats(prev => ({ ...prev, balances: data.balances }));
    });

    return () => {
      socket.off('balance_update');
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(checkNodeStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, checkNodeStatus]);

  if (loading) return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <Loader2 className="text-yellow-500" size={48} />
      </motion.div>
      <span className="text-[10px] font-black uppercase tracking-[0.8em] text-yellow-500/40 animate-pulse">Initializing Terminal...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      
      {/* 🔔 COMPLIANCE NOTIFICATION */}
      <AnimatePresence>
        {unreadSupport && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={() => navigate('/support')}
            className="fixed top-32 right-8 z-[100] cursor-pointer group"
          >
            <div className="bg-yellow-500 text-black px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] border border-yellow-400">
              <MessageSquareDot className="animate-bounce" size={20} />
              <div className="flex flex-col">
                <span className="font-black uppercase text-[10px] tracking-widest">Support Update</span>
                <span className="text-[9px] font-bold opacity-70">New message from Zurich HQ</span>
              </div>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER NODE ── */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/60">
              Institutional Terminal // Active
            </h1>
          </div>
          <p className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
            Investor: {stats?.username}
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/[0.03] border border-white/10 px-8 py-5 rounded-[2rem] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Globe size={18} className="text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase opacity-40">Mainnet Node</span>
              <span className="text-[11px] font-bold font-mono uppercase tracking-widest">ZURICH_HQ_01</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex items-center gap-4">
            <Activity size={18} className={latency === 'OFFLINE' ? "text-red-500" : "text-emerald-400"} />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase opacity-40">Latency</span>
              <span className="text-[11px] font-bold font-mono tracking-widest uppercase">
                {latency === 'OFFLINE' ? 'Disconnected' : `${latency}MS`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── METRICS CLUSTER ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <ProtocolStat label="Allocated Capital" value={stats?.balances?.EUR || 0} icon={Wallet} color="text-white" />
        <ProtocolStat label="Realized Yield" value={stats?.balances?.ROI || 0} icon={TrendingUp} color="text-yellow-500" />
        <ProtocolStat label="Active Daily ROI" value={3.24} icon={Zap} color="text-emerald-400" suffix="%" prefix="" />
      </div>

      {/* ── ANALYTICS ENGINE ── */}
      <section className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] mb-12 backdrop-blur-md relative overflow-hidden group">
        <div className="flex justify-between items-center mb-12 relative z-10">
          <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-4">
            <Activity className="text-yellow-500" size={24} />
            Yield Projections
          </h3>
          <button onClick={fetchDashboardData} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
            <RefreshCw size={20} className="opacity-40 group-hover:rotate-180 transition-transform duration-1000" />
          </button>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: '900' }} dy={20} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip cursor={{ stroke: '#eab308', strokeWidth: 1 }} contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }} />
              <Area type="monotone" dataKey="yield" stroke="#eab308" strokeWidth={5} fill="url(#yieldGrad)" animationDuration={2500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── VAULT DEPOSIT SECTION (Unique Addresses + QR) ── */}
      <VaultSection />

      {/* ── ACTION FOOTER ── */}
      <footer className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          onClick={() => navigate('/invest')} 
          className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] flex items-center justify-between group cursor-pointer hover:border-yellow-500/40 transition-all"
        >
          <div className="flex items-center gap-8">
            <div className="bg-yellow-500/10 p-5 rounded-2xl group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500">
              <Zap size={28} />
            </div>
            <div>
              <h4 className="text-2xl font-black italic uppercase tracking-tighter">Compound</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase mt-1 tracking-widest">Inject Yield to Principal</p>
            </div>
          </div>
          <ArrowUpRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }} 
          onClick={() => navigate('/support')} 
          className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] flex items-center justify-between group cursor-pointer hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center gap-8">
            <div className="bg-blue-500/10 p-5 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-all duration-500">
              <LifeBuoy size={28} />
            </div>
            <div>
              <h4 className="text-2xl font-black italic uppercase tracking-tighter">Concierge</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase mt-1 tracking-widest">24/7 Swiss Support Desk</p>
            </div>
          </div>
          <ChevronRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </motion.div>
      </footer>

      {/* WATERMARK */}
      <div className="mt-24 text-center opacity-[0.03] pointer-events-none select-none">
        <h2 className="text-[150px] font-black italic uppercase tracking-tighter leading-none">TRUSTRA</h2>
      </div>
    </div>
  );
}
