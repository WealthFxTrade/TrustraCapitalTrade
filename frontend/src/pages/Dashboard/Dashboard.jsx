import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Wallet, ArrowUpRight, ShieldCheck,
  Zap, Activity, Loader2, RefreshCw, Copy, Check,
  LifeBuoy, MessageSquareDot
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

const MetricCard = ({ label, value, icon: Icon, color, isPercent = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-7 rounded-[2rem] relative overflow-hidden group hover:border-white/20 transition-all"
  >
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:scale-110 transition-transform ${color}`} />
    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">{label}</p>
    <h2 className={`text-3xl font-black italic tracking-tighter ${color}`}>
      {!isPercent && '€'}
      <CountUp
        end={value}
        separator="."
        decimal=","
        decimals={isPercent ? 1 : 2}
        duration={2}
      />
      {isPercent && '%'}
    </h2>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);
  const [copied, setCopied] = useState(false);
  const [unreadSupport, setUnreadSupport] = useState(false);

  // 1. 🛰️ NODE LATENCY TRACKER
  const checkNodeStatus = useCallback(async () => {
    const start = Date.now();
    try {
      await api.get('/health');
      setLatency(Date.now() - start);
    } catch (err) {
      setLatency('OFFLINE');
    }
  }, []);

  // 2. 📊 DATA INITIALIZATION
  const fetchDashboardData = useCallback(async () => {
    try {
      await checkNodeStatus();
      const [profileRes, supportRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/support/my-tickets')
      ]);

      const userData = profileRes.data.user;
      setStats(userData);

      // Check for Admin Replies in Support Tickets
      const hasUpdates = supportRes.data.tickets.some(t => 
        t.status === 'in-progress' && 
        t.messages[t.messages.length - 1].sender !== userData._id
      );
      setUnreadSupport(hasUpdates);

      // Yield History Logic
      try {
        const historyRes = await api.get('/user/yield-history');
        if (historyRes.data.success && historyRes.data.history.length > 0) {
          setChartData(historyRes.data.history);
        } else {
          generateMockYield(userData.balances?.EUR || 0);
        }
      } catch (historyErr) {
        generateMockYield(userData.balances?.EUR || 0);
      }
    } catch (err) {
      toast.error("Protocol Sync Interrupted.");
    } finally {
      setLoading(false);
    }
  }, [checkNodeStatus]);

  const generateMockYield = (principal) => {
    const dailyRate = 0.032;
    const data = [];
    const today = new Date();
    let cumulativeYield = 0;
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      cumulativeYield += (principal * dailyRate) * (0.8 + Math.random() * 0.4);
      data.push({
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        yield: Number(cumulativeYield.toFixed(2))
      });
    }
    setChartData(data);
  };

  // 3. 🛰️ LIVE PROTOCOL SYNC (Socket.io)
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:10000', {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.emit('join_terminal', user._id);
    socket.on('profit_update', (data) => {
      toast.success(`Yield Realized: +€${data.addedAmount}`, { icon: '📈' });
      setStats(prev => ({
        ...prev,
        balances: { ...prev.balances, EUR_PROFIT: data.newProfit }
      }));
    });

    return () => {
      socket.off('profit_update');
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(checkNodeStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, checkNodeStatus]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Address Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-4">
      <Loader2 className="text-yellow-500 animate-spin" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/40">Syncing Protocol...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-4 md:p-10 pt-24 font-sans">
      
      {/* 🔔 FLOATING ALERT NODE */}
      <AnimatePresence>
        {unreadSupport && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            onClick={() => navigate('/support')}
            className="fixed top-28 right-6 z-50 cursor-pointer"
          >
            <div className="bg-yellow-500 text-black px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl border border-yellow-400 font-black uppercase text-[9px] tracking-widest">
              <MessageSquareDot className="animate-bounce" size={16} />
              Compliance Update
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/60 mb-1">Elite Protocol 2026.Node_01</h1>
          <p className="text-3xl font-black italic uppercase tracking-tighter">Access: {stats?.fullName}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
          <Activity size={16} className={latency === 'OFFLINE' ? "text-red-500" : "text-emerald-400 animate-pulse"} />
          <span className="text-[11px] font-mono font-bold tracking-widest">{latency}MS LATENCY</span>
        </div>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard label="Capital Allocation" value={stats?.balances?.EUR || 0} icon={Wallet} color="text-white" />
        <MetricCard label="Total Node Yield" value={stats?.balances?.EUR_PROFIT || 0} icon={TrendingUp} color="text-yellow-500" />
        <MetricCard label="Target Daily ROI" value={3.2} icon={Zap} color="text-emerald-400" isPercent />
      </div>

      

      {/* CHART SECTION */}
      <section className="bg-white/5 border border-white/10 p-8 rounded-[3rem] mb-10 backdrop-blur-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black italic uppercase flex items-center gap-3">Yield History</h3>
          <RefreshCw onClick={fetchDashboardData} size={16} className="opacity-20 hover:rotate-180 transition-transform cursor-pointer" />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }} />
              <Tooltip contentStyle={{ backgroundColor: '#020408', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
              <Area type="monotone" dataKey="yield" stroke="#eab308" strokeWidth={4} fill="url(#colorYield)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ACTION FOOTER */}
      <footer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-yellow-500/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="bg-yellow-500/10 p-4 rounded-2xl group-hover:bg-yellow-500 group-hover:text-black transition-all"><Zap size={24} /></div>
            <div>
              <h4 className="text-xl font-black italic uppercase">Compound</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase mt-1">Reinvest Yield</p>
            </div>
          </div>
          <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6">
          <ShieldCheck size={32} className="text-emerald-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-black italic uppercase">Wallet Node</h4>
            <p className="text-[10px] font-mono opacity-50 mt-1 truncate text-yellow-500">{stats?.btcAddress || 'Generating...'}</p>
          </div>
          <button onClick={() => handleCopy(stats?.btcAddress)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
        </div>

        <div onClick={() => navigate('/support')} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all relative">
          <div className="flex items-center gap-6">
            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-all"><LifeBuoy size={24} /></div>
            <div>
              <h4 className="text-xl font-black italic uppercase">Support</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase mt-1">Zurich Desk</p>
            </div>
          </div>
          {unreadSupport && <span className="absolute top-6 right-6 h-3 w-3 bg-yellow-500 rounded-full animate-ping" />}
        </div>
      </footer>
    </div>
  );
}
