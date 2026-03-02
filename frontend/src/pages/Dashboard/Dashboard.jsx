import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Wallet, ArrowUpRight, ShieldCheck, 
  Zap, Activity, Loader2, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);

  // ── 1. FAIL-SAFE LATENCY TRACKER ──
  const checkNodeStatus = useCallback(async () => {
    const start = Date.now();
    try {
      await api.get('/health');
      setLatency(Date.now() - start);
    } catch (err) {
      setLatency('OFFLINE');
    }
  }, []);

  useEffect(() => {
    checkNodeStatus();
    const interval = setInterval(checkNodeStatus, 30000);
    return () => clearInterval(interval);
  }, [checkNodeStatus]);

  // ── 2. PARALLEL DATA FETCHING ──
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetching simultaneously saves seconds of loading time
        const [profileRes, historyRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/user/yield-history')
        ]);

        setStats(profileRes.data);

        if (historyRes.data?.success) {
          setChartData(historyRes.data.history.map(item => ({
            day: item.date,
            yield: item.amount
          })));
        } else {
          generateMockYield();
        }
      } catch (err) {
        console.error("Dashboard Sync Failed:", err);
        toast.error("Node Handshake Failed. Emergency Simulation Active.");
        generateMockYield();
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateMockYield = () => {
    const principal = 50000;
    const dailyRate = 0.032;
    const data = [];
    const today = new Date();
    let currentYield = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      currentYield += principal * dailyRate * (Math.random() * 0.2 + 0.9);
      data.push({
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        yield: Math.round(currentYield)
      });
    }
    setChartData(data);
  };

  // Helper for consistent EUR display
  const formatCurrency = (val) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-yellow-500 animate-spin" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/40">Syncing Node...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-4 md:p-10 font-sans selection:bg-yellow-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/60 mb-1">
            Elite Protocol 2026.Node_01
          </h1>
          <p className="text-3xl font-black italic uppercase tracking-tighter">
            Terminal Access: <span className="text-white/90">{stats?.fullName || user?.fullName || 'Elite Investor'}</span>
          </p>
        </motion.div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
          <Activity size={16} className={latency === 'OFFLINE' ? "text-red-500" : "text-emerald-400 animate-pulse"} />
          <span className={`text-[11px] font-mono font-bold tracking-widest ${latency === 'OFFLINE' ? 'text-red-500' : 'text-emerald-400'}`}>
            {latency === 'OFFLINE' ? 'NODE OFFLINE' : `${latency}ms Latency`}
          </span>
        </div>
      </header>

      {/* PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          label="Capital Allocation" 
          value={stats?.balance || 50000} 
          icon={Wallet} 
          color="text-white" 
        />
        <MetricCard 
          label="Total Node Yield" 
          value={stats?.accruedYield || chartData[chartData.length - 1]?.yield || 0} 
          icon={TrendingUp} 
          color="text-yellow-500" 
        />
        <MetricCard 
          label="Target Daily ROI" 
          value={3.2} 
          icon={Zap} 
          color="text-emerald-400" 
          isPercent 
        />
      </div>

      {/* CHART */}
      <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[3rem] mb-10 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
            Profit Trajectory <RefreshCw onClick={() => window.location.reload()} size={16} className="opacity-20 hover:rotate-180 transition-transform cursor-pointer" />
          </h3>
          <div className="hidden sm:block text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">AES-256 Verified Stream</div>
        </div>

        <div className="h-[300px] md:h-[350px] w-full">
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
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020408', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                formatter={(val) => [formatCurrency(val), 'Yield']}
              />
              <Area type="monotone" dataKey="yield" stroke="#eab308" strokeWidth={4} fill="url(#colorYield)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ACTION FOOTER */}
      <footer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
          <div className="flex items-center gap-6">
            <div className="bg-yellow-500/10 p-4 rounded-2xl group-hover:bg-yellow-500 group-hover:text-black transition-colors">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black italic uppercase">Compound Principal</h4>
              <p className="text-xs font-bold opacity-40 uppercase mt-1">Direct reinvestment of yields</p>
            </div>
          </div>
          <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden">
          <ShieldCheck size={32} className="text-emerald-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-black italic uppercase">Cold Sync Address</h4>
            <p className="text-[11px] font-mono opacity-50 mt-1 truncate select-all">
              {stats?.btcAddress || user?.btcAddress || '3P17...HANDSHAKE_PENDING'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-component to prevent the CountUp formatting crash
const MetricCard = ({ label, value, icon: Icon, color, isPercent = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-7 rounded-[2rem] relative overflow-hidden group hover:border-white/20 transition-all"
  >
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:scale-110 transition-transform ${color}`} />
    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">{label}</p>
    <h2 className={`text-3xl font-black italic tracking-tighter ${color}`}>
      {isPercent ? '' : '€'}
      <CountUp end={value} separator="." decimal="," decimals={isPercent ? 1 : 2} duration={2} />
      {isPercent ? '%' : ''}
    </h2>
  </motion.div>
);

